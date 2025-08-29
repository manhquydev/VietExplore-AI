import { NextRequest, NextResponse } from 'next/server';

// POST /api/address/convert - Chuyển đổi địa chỉ cũ sang mới sau sáp nhập
export async function POST(request: NextRequest) {
  try {
    const { provinceId, districtId, wardId } = await request.json();

    if (!provinceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thiếu provinceId',
          data: null
        },
        { status: 400 }
      );
    }

    // Lấy thông tin đầy đủ về tỉnh, quận, xã
    const [provincesRes, districtsRes, wardsRes] = await Promise.all([
      fetch('https://tailieu365.com/api/address/province?mode=0', {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'VietExplore-AI/1.0' }
      }),
      districtId ? fetch(`https://tailieu365.com/api/address/district?provinceId=${provinceId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'VietExplore-AI/1.0' }
      }) : Promise.resolve(null),
      wardId ? fetch(`https://tailieu365.com/api/address/ward?districtId=${districtId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'VietExplore-AI/1.0' }
      }) : Promise.resolve(null)
    ]);

    if (!provincesRes.ok) {
      throw new Error('Failed to fetch province data');
    }

    const provinces = await provincesRes.json();
    const districts = districtsRes ? await districtsRes.json() : [];
    const wards = wardsRes ? await wardsRes.json() : [];

    const currentProvince = provinces.find((p: any) => p.id.toString() === provinceId.toString());
    const currentDistrict = districts.find((d: any) => d.id.toString() === districtId?.toString());
    const currentWard = wards.find((w: any) => w.id.toString() === wardId?.toString());

    if (!currentProvince) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy tỉnh',
          data: null
        },
        { status: 404 }
      );
    }

    // Xây dựng địa chỉ cũ (hiện tại)
    const oldAddress = {
      province: { id: currentProvince.id, name: currentProvince.name },
      district: currentDistrict ? { id: currentDistrict.id, name: currentDistrict.name } : null,
      ward: currentWard ? { id: currentWard.id, name: currentWard.name } : null,
      fullAddress: [
        currentWard?.name,
        currentDistrict?.name, 
        currentProvince.name
      ].filter(Boolean).join(', ')
    };

    // Tìm địa chỉ mới nếu có sáp nhập
    let newAddress = null;
    let conversionMessage = [];

    // Kiểm tra sáp nhập tỉnh
    if (currentProvince.newId && currentProvince.newId !== currentProvince.id) {
      const newProvince = provinces.find((p: any) => p.id === currentProvince.newId);
      if (newProvince) {
        // Khi sáp nhập tỉnh, cấu trúc hành chính thay đổi: Tỉnh → Xã (bỏ cấp huyện)
        // Cần tìm xã/phường mới trực thuộc tỉnh mới
        let newWardForProvince = null;
        
        if (currentWard) {
          // Tìm xã/phường mới trong tỉnh mới bằng cách check newId hoặc tên tương tự
          const newProvinceWards = await fetch(`https://tailieu365.com/api/address/ward?provinceId=${newProvince.id}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'VietExplore-AI/1.0' }
          }).then(res => res.json());
          
          // Tìm ward có newId mapping hoặc tên giống
          newWardForProvince = newProvinceWards.find((w: any) => 
            w.id === currentWard.newId || 
            w.name === currentWard.name ||
            (currentWard.newId && w.id === currentWard.newId)
          );
        }
        
        newAddress = {
          province: { id: newProvince.id, name: newProvince.name },
          district: null, // Sau sáp nhập không còn cấp huyện
          ward: newWardForProvince ? { id: newWardForProvince.id, name: newWardForProvince.name } : (currentWard ? { id: currentWard.id, name: currentWard.name } : null),
          fullAddress: [
            newWardForProvince?.name || currentWard?.name,
            newProvince.name // Chỉ còn Xã → Tỉnh
          ].filter(Boolean).join(', ')
        };
        
        conversionMessage.push(`Tỉnh ${currentProvince.name} → ${newProvince.name}`);
        if (newWardForProvince && newWardForProvince.name !== currentWard?.name) {
          conversionMessage.push(`${currentWard?.name} → ${newWardForProvince.name}`);
        }
        if (currentDistrict) {
          conversionMessage.push(`Bỏ cấp huyện: ${currentDistrict.name}`);
        }
      }
    }

    // Kiểm tra sáp nhập ward (chỉ khi không có sáp nhập tỉnh)
    if (currentWard && currentWard.newId && currentWard.newId !== currentWard.id && !newAddress) {
      const allWards = await fetch(`https://tailieu365.com/api/address/ward?provinceId=${provinceId}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'VietExplore-AI/1.0' }
      }).then(res => res.json());
      
      const newWard = allWards.find((w: any) => w.id === currentWard.newId);
      if (newWard) {
        newAddress = { ...oldAddress };
        newAddress.ward = { id: newWard.id, name: newWard.name };
        newAddress.fullAddress = [
          newWard.name,
          currentDistrict?.name, 
          currentProvince.name
        ].filter(Boolean).join(', ');
        conversionMessage.push(`${currentWard.name} → ${newWard.name}`);
      }
    }

    const result = {
      oldAddress,
      newAddress,
      hasChanges: newAddress !== null,
      conversionMessage: conversionMessage.length > 0 ? conversionMessage.join('; ') : 'Không có thay đổi',
      status: newAddress ? 'converted' : 'unchanged'
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error converting address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể chuyển đổi địa chỉ',
        data: null
      },
      { status: 500 }
    );
  }
}