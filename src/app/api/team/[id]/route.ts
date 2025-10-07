import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

const adminDb = getAdminDb();
import {
  TeamMember,
  TeamMemberFormData,
  validateTeamMemberForm
} from '@/lib/types/team';

/**
 * GET /api/team/[id]
 * Fetch a single team member by ID or slug
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[TEAM-API] GET single member:', id);

    let memberDoc;

    // Try to fetch by document ID first
    memberDoc = await adminDb.collection('team_members').doc(id).get();

    // If not found, try by slug
    if (!memberDoc.exists) {
      const querySnapshot = await adminDb
        .collection('team_members')
        .where('slug', '==', id)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        memberDoc = querySnapshot.docs[0];
      }
    }

    if (!memberDoc || !memberDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found'
        },
        { status: 404 }
      );
    }

    const member: TeamMember = {
      id: memberDoc.id,
      ...memberDoc.data()
    } as TeamMember;

    console.log(`[TEAM-API] Found member: ${member.fullName}`);

    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error: any) {
    console.error('[TEAM-API] GET single error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch team member'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/team/[id]
 * Update a team member
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const { user } = await verifyAuthToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    console.log('[TEAM-API] PATCH request for member:', id);

    // Check if member exists
    const memberRef = adminDb.collection('team_members').doc(id);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found'
        },
        { status: 404 }
      );
    }

    // Validate form data
    const validation = validateTeamMemberForm(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    const currentData = memberDoc.data() as TeamMember;
    if (body.slug && body.slug !== currentData.slug) {
      const existingSlug = await adminDb
        .collection('team_members')
        .where('slug', '==', body.slug)
        .limit(1)
        .get();

      if (!existingSlug.empty && existingSlug.docs[0].id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug đã tồn tại. Vui lòng chọn slug khác.',
            details: { slug: 'Slug đã được sử dụng' }
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<TeamMember> = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    // Don't allow changing system fields
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    delete (updateData as any).createdBy;

    // Update document
    await memberRef.update(updateData);

    // Fetch updated document
    const updatedDoc = await memberRef.get();
    const updatedMember: TeamMember = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as TeamMember;

    console.log(`[TEAM-API] Updated member: ${updatedMember.fullName}`);

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Cập nhật thành viên thành công'
    });
  } catch (error: any) {
    console.error('[TEAM-API] PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update team member'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/team/[id]
 * Delete (or soft-delete) a team member
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const { user } = await verifyAuthToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    console.log('[TEAM-API] DELETE request for member:', id);

    // Check if member exists
    const memberRef = adminDb.collection('team_members').doc(id);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found'
        },
        { status: 404 }
      );
    }

    // Check query param for hard delete vs soft delete
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Permanently delete the document
      await memberRef.delete();
      console.log(`[TEAM-API] Hard deleted member: ${id}`);
    } else {
      // Soft delete: set status to inactive
      await memberRef.update({
        status: 'inactive',
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      });
      console.log(`[TEAM-API] Soft deleted member: ${id}`);
    }

    return NextResponse.json({
      success: true,
      message: hardDelete
        ? 'Xóa thành viên vĩnh viễn thành công'
        : 'Đã ẩn thành viên khỏi trang công khai'
    });
  } catch (error: any) {
    console.error('[TEAM-API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete team member'
      },
      { status: 500 }
    );
  }
}
