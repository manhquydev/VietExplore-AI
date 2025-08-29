import { NextRequest, NextResponse } from 'next/server';

// GET /api/address/districts - Lấy danh sách quận/huyện theo tỉnh
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');

    if (!provinceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thiếu tham số provinceId',
          data: [],
          total: 0
        },
        { status: 400 }
      );
    }

    // First, get all provinces to find the correct mapping
    const provincesResponse = await fetch('https://tailieu365.com/api/address/province?mode=0', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VietExplore-AI/1.0'
      },
      cache: 'force-cache',
      next: { revalidate: 86400 }
    });

    if (!provincesResponse.ok) {
      throw new Error('Failed to fetch provinces for mapping');
    }

    const provinces = await provincesResponse.json();
    const targetProvince = provinces.find((p: any) => p.id.toString() === provinceId);
    
    if (!targetProvince) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy tỉnh với ID đã cho',
          data: [],
          total: 0
        },
        { status: 404 }
      );
    }

    // Determine the correct province ID to query districts
    let queryProvinceId = provinceId;
    
    // If this is a new province, we need to use the old province ID for districts lookup
    if (targetProvince.isNew === true && targetProvince.newId) {
      // Find the corresponding old province
      const oldProvince = provinces.find((p: any) => 
        !p.isNew && p.newId && p.newId.toString() === provinceId
      );
      if (oldProvince) {
        queryProvinceId = oldProvince.id.toString();
      }
    }
    // If this is an old province that has been split, still use its ID
    else if (targetProvince.isNew === false || targetProvince.isNew === null) {
      queryProvinceId = provinceId;
    }

    const response = await fetch(`https://tailieu365.com/api/address/district?provinceId=${queryProvinceId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VietExplore-AI/1.0'
      },
      cache: 'force-cache',
      next: { revalidate: 86400 } // Cache 1 ngày
    });

    if (!response.ok) {
      console.error(`District API failed for provinceId ${queryProvinceId} (original ${provinceId})`);
      throw new Error('Failed to fetch districts from external API');
    }

    const districts = await response.json();

    // Sort districts alphabetically
    const sortedDistricts = districts.sort((a: any, b: any) => 
      a.name.localeCompare(b.name, 'vi')
    );

    return NextResponse.json({
      success: true,
      data: sortedDistricts,
      total: sortedDistricts.length,
      debug: process.env.NODE_ENV === 'development' ? {
        requestedProvinceId: provinceId,
        actualQueryProvinceId: queryProvinceId,
        provinceInfo: targetProvince,
        mappingUsed: queryProvinceId !== provinceId ? 'old-province-lookup' : 'direct'
      } : undefined
    });

  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể tải danh sách quận/huyện',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}