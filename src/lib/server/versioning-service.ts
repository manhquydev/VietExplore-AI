/**
 * Versioning Service - Quản lý versioning cho địa điểm theo tài liệu mục 2.3.1
 * 
 * Nguyên tắc:
 * - Version hiện tại tiếp tục hiển thị public
 * - Version mới được tạo với status 'draft_edit'
 * - Chỉ khi approved, version mới thay thế version cũ
 */

import { getAdminDb } from './firebaseAdmin';
import { Place } from '@/lib/types/places';
import { ConflictResolutionService } from './conflict-resolution-service';
import { FieldValue } from 'firebase-admin/firestore';

export interface PlaceVersion {
  id: string;
  originalPlaceId: string;
  versionNumber: number;
  data: Partial<Place>;
  createdBy: string;
  createdAt: string;
  status: 'draft_edit' | 'under_review' | 'approved' | 'rejected';
  parentVersion?: number;
  isActive: boolean; // Version hiện tại đang được sử dụng
  editReason?: string;
  moderationHistory: Array<{
    action: string;
    moderatorId: string;
    reason: string;
    createdAt: string;
  }>;
}

export class VersioningService {
  private static adminDb = getAdminDb();

  /**
   * Tạo version mới cho địa điểm đã published
   * Theo tài liệu: version hiện tại tiếp tục hiển thị
   */
  static async createEditVersion(
    originalPlaceId: string, 
    editData: Partial<Place>, 
    userId: string,
    editReason?: string,
    userRole: string = 'contributor'
  ): Promise<{ success: boolean; versionId?: string; error?: string; conflictInfo?: any }> {
    try {
      // Lấy thông tin place gốc
      const originalPlaceDoc = await this.adminDb.collection('places').doc(originalPlaceId).get();
      if (!originalPlaceDoc.exists) {
        return { success: false, error: 'Địa điểm gốc không tồn tại' };
      }

      const originalPlace = originalPlaceDoc.data() as Place;
      
      // Chỉ cho phép edit những place đã published
      if (originalPlace.status !== 'published') {
        return { success: false, error: 'Chỉ có thể chỉnh sửa địa điểm đã xuất bản' };
      }

      // Xác định request type dựa trên user role và context
      let requestType: 'admin_edit' | 'moderator_edit' | 'owner_edit' = 'owner_edit';
      if (userRole === 'admin') {
        requestType = 'admin_edit';
      } else if (userRole === 'moderator') {
        requestType = 'moderator_edit';
      } else if (originalPlace.createdBy === userId) {
        requestType = 'owner_edit';
      }

      // Sử dụng ConflictResolutionService để kiểm tra conflicts theo tài liệu 2.3.2
      const conflictResult = await ConflictResolutionService.createEditRequest(
        originalPlaceId,
        userId,
        userRole,
        requestType,
        editData,
        editReason || 'Yêu cầu chỉnh sửa địa điểm',
        { editType: 'version_edit' }
      );

      if (!conflictResult.success) {
        return {
          success: false,
          error: conflictResult.error,
          conflictInfo: conflictResult.conflictInfo
        };
      }

      // Nếu request bị queue, return thông báo
      if (conflictResult.conflictInfo?.status === 'queued') {
        return {
          success: false,
          error: 'Yêu cầu chỉnh sửa đã được đưa vào hàng đợi do có yêu cầu ưu tiên cao hơn đang xử lý',
          conflictInfo: conflictResult.conflictInfo
        };
      }

      // Lấy version number tiếp theo
      const versionQuery = await this.adminDb
        .collection('place_versions')
        .where('originalPlaceId', '==', originalPlaceId)
        .orderBy('versionNumber', 'desc')
        .limit(1)
        .get();

      const nextVersionNumber = versionQuery.empty ? 2 : (versionQuery.docs[0].data().versionNumber + 1);

      // Tạo version mới
      const versionData: PlaceVersion = {
        id: '', // Sẽ được gán sau khi add
        originalPlaceId,
        versionNumber: nextVersionNumber,
        data: {
          ...originalPlace,
          ...editData,
          // Không thay đổi các field quan trọng
          id: originalPlaceId,
          createdBy: originalPlace.createdBy,
          createdAt: originalPlace.createdAt,
          publishedAt: originalPlace.publishedAt,
          status: 'draft_edit',
          updatedAt: new Date().toISOString()
        },
        createdBy: userId,
        createdAt: new Date().toISOString(),
        status: 'draft_edit',
        parentVersion: 1, // Version gốc luôn là 1
        isActive: false,
        editReason: editReason || 'Chỉnh sửa thông tin',
        moderationHistory: [{
          action: 'version_created',
          moderatorId: userId,
          reason: editReason || 'Tạo version mới để chỉnh sửa',
          createdAt: new Date().toISOString()
        }]
      };

      // Lưu version vào database
      const versionRef = await this.adminDb.collection('place_versions').add(versionData);
      versionData.id = versionRef.id;
      await versionRef.update({ id: versionRef.id });

      // Cập nhật trạng thái place gốc với conflict resolution info
      await this.adminDb.collection('places').doc(originalPlaceId).update({
        hasEditingVersion: true,
        editingVersionId: versionRef.id,
        editingVersionNumber: nextVersionNumber,
        activeEditRequestId: conflictResult.requestId,
        editConflictResolved: true,
        updatedAt: new Date().toISOString()
      });

      return { 
        success: true, 
        versionId: versionRef.id,
        conflictInfo: conflictResult.conflictInfo 
      };

    } catch (error) {
      console.error('Error creating edit version:', error);
      return { success: false, error: 'Không thể tạo version chỉnh sửa' };
    }
  }

  /**
   * Approve version và thay thế version cũ
   */
  static async approveVersion(
    versionId: string, 
    moderatorId: string, 
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.adminDb.runTransaction(async (transaction) => {
        // Lấy version data
        const versionRef = this.adminDb.collection('place_versions').doc(versionId);
        const versionDoc = await transaction.get(versionRef);
        
        if (!versionDoc.exists) {
          throw new Error('Version không tồn tại');
        }

        const version = versionDoc.data() as PlaceVersion;
        const originalPlaceRef = this.adminDb.collection('places').doc(version.originalPlaceId);
        const placeData = await transaction.get(originalPlaceRef);
        const activeEditRequestId = placeData.data()?.activeEditRequestId;
        
        // Cập nhật place gốc với data từ version
        transaction.update(originalPlaceRef, {
          ...version.data,
          status: 'published',
          updatedAt: new Date().toISOString(),
          hasEditingVersion: false,
          editingVersionId: null,
          editingVersionNumber: null,
          activeEditRequestId: null,
          editConflictResolved: false,
          lastApprovedVersion: version.versionNumber,
          moderationHistory: FieldValue.arrayUnion({
            action: 'edit_approved',
            moderatorId: moderatorId,
            reason: reviewNotes || 'Chỉnh sửa được phê duyệt',
            createdAt: new Date().toISOString(),
            versionNumber: version.versionNumber
          })
        });

        // Complete edit request trong conflict resolution system
        if (activeEditRequestId) {
          // Sử dụng setTimeout để avoid transaction deadlock
          setTimeout(async () => {
            await ConflictResolutionService.completeEditRequest(activeEditRequestId, 'completed');
          }, 1000);
        }

        // Cập nhật version status
        transaction.update(versionRef, {
          status: 'approved',
          isActive: true,
          approvedBy: moderatorId,
          approvedAt: new Date().toISOString(),
          moderationHistory: FieldValue.arrayUnion({
            action: 'approved',
            moderatorId: moderatorId,
            reason: reviewNotes || 'Version được phê duyệt',
            createdAt: new Date().toISOString()
          })
        });

        // Deactivate tất cả version cũ
        const oldVersionsQuery = await this.adminDb
          .collection('place_versions')
          .where('originalPlaceId', '==', version.originalPlaceId)
          .where('isActive', '==', true)
          .get();

        oldVersionsQuery.docs.forEach(doc => {
          transaction.update(doc.ref, { isActive: false });
        });

        return { success: true };
      });

    } catch (error) {
      console.error('Error approving version:', error);
      return { success: false, error: 'Không thể phê duyệt version' };
    }
  }

  /**
   * Reject version và xóa
   */
  static async rejectVersion(
    versionId: string, 
    moderatorId: string, 
    reviewNotes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.adminDb.runTransaction(async (transaction) => {
        const versionRef = this.adminDb.collection('place_versions').doc(versionId);
        const versionDoc = await transaction.get(versionRef);
        
        if (!versionDoc.exists) {
          throw new Error('Version không tồn tại');
        }

        const version = versionDoc.data() as PlaceVersion;
        
        // Cập nhật version status
        transaction.update(versionRef, {
          status: 'rejected',
          rejectedBy: moderatorId,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reviewNotes,
          moderationHistory: FieldValue.arrayUnion({
            action: 'rejected',
            moderatorId: moderatorId,
            reason: reviewNotes,
            createdAt: new Date().toISOString()
          })
        });

        // Clear editing status từ place gốc và complete edit request
        const originalPlaceRef = this.adminDb.collection('places').doc(version.originalPlaceId);
        const placeData = await transaction.get(originalPlaceRef);
        const activeEditRequestId = placeData.data()?.activeEditRequestId;

        transaction.update(originalPlaceRef, {
          hasEditingVersion: false,
          editingVersionId: null,
          editingVersionNumber: null,
          activeEditRequestId: null,
          editConflictResolved: false,
          updatedAt: new Date().toISOString()
        });

        // Complete edit request trong conflict resolution system
        if (activeEditRequestId) {
          await ConflictResolutionService.completeEditRequest(activeEditRequestId, 'rejected');
        }

        return { success: true };
      });

    } catch (error) {
      console.error('Error rejecting version:', error);
      return { success: false, error: 'Không thể từ chối version' };
    }
  }

  /**
   * Lấy version history của một place
   */
  static async getVersionHistory(originalPlaceId: string): Promise<PlaceVersion[]> {
    try {
      const versionsQuery = await this.adminDb
        .collection('place_versions')
        .where('originalPlaceId', '==', originalPlaceId)
        .orderBy('versionNumber', 'desc')
        .get();

      return versionsQuery.docs.map(doc => doc.data() as PlaceVersion);

    } catch (error) {
      console.error('Error getting version history:', error);
      return [];
    }
  }

  /**
   * Lấy version hiện tại đang active
   */
  static async getActiveVersion(originalPlaceId: string): Promise<PlaceVersion | null> {
    try {
      const activeVersionQuery = await this.adminDb
        .collection('place_versions')
        .where('originalPlaceId', '==', originalPlaceId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (activeVersionQuery.empty) {
        return null;
      }

      return activeVersionQuery.docs[0].data() as PlaceVersion;

    } catch (error) {
      console.error('Error getting active version:', error);
      return null;
    }
  }

  /**
   * Cleanup old versions (chỉ giữ lại 10 version gần nhất)
   */
  static async cleanupOldVersions(originalPlaceId: string): Promise<void> {
    try {
      const versionsQuery = await this.adminDb
        .collection('place_versions')
        .where('originalPlaceId', '==', originalPlaceId)
        .where('status', '==', 'approved')
        .orderBy('versionNumber', 'desc')
        .get();

      const versions = versionsQuery.docs;
      
      // Giữ lại 10 version gần nhất, xóa những cái cũ hơn
      if (versions.length > 10) {
        const versionsToDelete = versions.slice(10);
        
        const batch = this.adminDb.batch();
        versionsToDelete.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Cleaned up ${versionsToDelete.length} old versions for place ${originalPlaceId}`);
      }

    } catch (error) {
      console.error('Error cleaning up old versions:', error);
    }
  }
}