import { NextRequest, NextResponse } from 'next/server';

// GET /api/address/wards - Lấy danh sách xã/phường
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const provinceId = searchParams.get('provinceId');

    if (!districtId && !provinceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cần có districtId hoặc provinceId',
          data: [],
          total: 0
        },
        { status: 400 }
      );
    }

    let url = 'https://tailieu365.com/api/address/ward?';
    if (districtId) {
      url += `districtId=${districtId}`;
    } else if (provinceId) {
      url += `provinceId=${provinceId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Du Lịch Việt-AI/1.0'
      },
      cache: 'force-cache',
      next: { revalidate: 86400 } // Cache 1 ngày
    });

    if (!response.ok) {
      console.error(`Wards API failed for districtId: ${districtId}, provinceId: ${provinceId}`);
      throw new Error('Failed to fetch wards from external API');
    }

    const wards = await response.json();

    // Filter wards to only show ones for the specific district if districtId is provided
    let filteredWards = wards;
    if (districtId) {
      filteredWards = wards.filter((ward: any) => 
        ward.districtId && ward.districtId.toString() === districtId
      );
    }

    // Sort wards alphabetically
    const sortedWards = filteredWards.sort((a: any, b: any) => 
      a.name.localeCompare(b.name, 'vi')
    );

    return NextResponse.json({
      success: true,
      data: sortedWards,
      total: sortedWards.length,
      debug: process.env.NODE_ENV === 'development' ? {
        totalWards: wards.length,
        filteredWards: filteredWards.length,
        sortedWards: sortedWards.length,
        districtId,
        provinceId
      } : undefined
    });

  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể tải danh sách xã/phường',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}