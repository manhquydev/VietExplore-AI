import { NextRequest, NextResponse } from 'next/server';
import { PlaceFormData } from '@/lib/types/places';

// Vercel Edge Function configuration (Section 2.1.1 + 5.1.2)
export const runtime = 'edge';
export const regions = ['sin1', 'hkg1']; // Gần Việt Nam theo tài liệu

/**
 * Edge Function for form validation - Section 2.1.1
 * "Form data được validate tại Vercel Edge Function (faster response)"
 */
export async function POST(request: NextRequest) {
  try {
    const formData: PlaceFormData = await request.json();

    // Validate required fields (faster at edge)
    const validationErrors: string[] = [];

    if (!formData.name || formData.name.trim().length < 3) {
      validationErrors.push('Tên địa điểm phải có ít nhất 3 ký tự');
    }

    if (!formData.description || formData.description.trim().length < 20) {
      validationErrors.push('Mô tả phải có ít nhất 20 ký tự');
    }

    if (!formData.shortDescription || formData.shortDescription.trim().length < 10) {
      validationErrors.push('Mô tả ngắn phải có ít nhất 10 ký tự');
    }

    if (!formData.region || !['bac-bo', 'trung-bo', 'nam-bo'].includes(formData.region)) {
      validationErrors.push('Vùng miền không hợp lệ');
    }

    if (!formData.province || formData.province.trim().length < 2) {
      validationErrors.push('Tỉnh/thành phố không được để trống');
    }

    if (!formData.type || !['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in'].includes(formData.type)) {
      validationErrors.push('Loại địa điểm không hợp lệ');
    }

    if (!formData.address || formData.address.trim().length < 5) {
      validationErrors.push('Địa chỉ phải có ít nhất 5 ký tự');
    }

    // Validate images (bắt buộc có ít nhất 1 ảnh)
    if (!formData.images || formData.images.length === 0) {
      validationErrors.push('Cần có ít nhất 1 ảnh cho địa điểm');
    } else if (formData.images.length > 10) {
      validationErrors.push('Không thể upload quá 10 ảnh');
    }

    // Validate video (tối đa 1 video)
    if (formData.video && Array.isArray(formData.video)) {
      validationErrors.push('Chỉ được upload tối đa 1 video');
    }

    // Validate tags
    if (formData.tags && formData.tags.length > 20) {
      validationErrors.push('Không thể có quá 20 tags');
    }

    // Validate coordinates if provided
    if (formData.coordinates) {
      const { lat, lng } = formData.coordinates;
      if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        validationErrors.push('Tọa độ không hợp lệ');
      }
    }

    // Advanced content validation at edge
    const nameWords = formData.name.trim().split(/\s+/);
    if (nameWords.length > 20) {
      validationErrors.push('Tên địa điểm không được quá 20 từ');
    }

    // Check for spam patterns
    const spamPatterns = [
      /\b(buy|sell|cheap|free|click|here|www|http)\b/i,
      /(.)\1{4,}/, // Repeated characters
      /[A-Z]{5,}/, // Too many caps
    ];
    
    const textToCheck = `${formData.name} ${formData.description}`;
    if (spamPatterns.some(pattern => pattern.test(textToCheck))) {
      validationErrors.push('Nội dung có dấu hiệu spam');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: validationErrors,
          message: 'Dữ liệu không hợp lệ'
        },
        { status: 400 }
      );
    }

    // Validation passed
    return NextResponse.json({
      success: true,
      message: 'Dữ liệu hợp lệ',
      data: {
        validatedAt: new Date().toISOString(),
        processingRegion: request.geo?.region || 'unknown',
        edgeLocation: request.geo?.city || 'unknown'
      }
    });

  } catch (error) {
    console.error('Edge validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi xử lý dữ liệu',
        message: 'Không thể validate form data'
      },
      { status: 500 }
    );
  }
}