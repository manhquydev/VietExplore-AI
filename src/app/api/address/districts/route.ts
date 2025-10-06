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
        'User-Agent': 'Du Lịch Việt-AI/1.0'
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
    if (targetProvince.isNew === true) {
      // Find all old provinces that map to this new province
      const oldProvinces = provinces.filter((p: any) => 
        (p.isNew === false || p.isNew === null) && 
        p.newId && 
        p.newId.toString() === provinceId
      );
      
      if (oldProvinces.length > 0) {
        // If multiple old provinces map to this new province, 
        // prioritize the one with the same name
        const exactNameMatch = oldProvinces.find((p: any) => 
          p.name === targetProvince.name
        );
        
        const selectedOldProvince = exactNameMatch || oldProvinces[0];
        queryProvinceId = selectedOldProvince.id.toString();
        
        console.log(`Mapping new province ${provinceId} (${targetProvince.name}) to old province ${queryProvinceId} (${selectedOldProvince.name})`);
        if (oldProvinces.length > 1) {
          console.log(`Multiple mappings found, selected: ${selectedOldProvince.name} (exact name match: ${!!exactNameMatch})`);
        }
      } else {
        console.warn(`No old province mapping found for new province ${provinceId} (${targetProvince.name})`);
      }
    }
    // If this is an old province, use its ID directly
    else if (targetProvince.isNew === false || targetProvince.isNew === null) {
      queryProvinceId = provinceId;
    }

    const response = await fetch(`https://tailieu365.com/api/address/district?provinceId=${queryProvinceId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Du Lịch Việt-AI/1.0'
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