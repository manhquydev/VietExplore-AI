import { NextRequest, NextResponse } from 'next/server';

// GET /api/address/provinces - Lấy danh sách tỉnh/thành phố Việt Nam
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || '0'; // Default lấy tất cả (cũ và mới)

    const response = await fetch(`https://tailieu365.com/api/address/province?mode=${mode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VietExplore-AI/1.0'
      },
      cache: 'force-cache', // Cache 1 ngày
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch provinces from external API');
    }

    const provinces = await response.json();

    // Transform and sort data để phù hợp với dự án
    const transformedProvinces = provinces
      .map((province: any) => ({
        id: province.id,
        name: province.name,
        isNew: province.isNew,
        newId: province.newId,
        // Phân vùng miền theo tỉnh
        region: getRegionByProvinceName(province.name)
      }))
      .sort((a: any, b: any) => {
        // Sắp xếp theo region trước, rồi theo tên
        if (a.region !== b.region) {
          const regionOrder = { 'bac-bo': 0, 'trung-bo': 1, 'nam-bo': 2 };
          return regionOrder[a.region as keyof typeof regionOrder] - regionOrder[b.region as keyof typeof regionOrder];
        }
        return a.name.localeCompare(b.name, 'vi');
      });

    return NextResponse.json({
      success: true,
      data: transformedProvinces,
      total: transformedProvinces.length
    });

  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể tải danh sách tỉnh/thành phố',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// Helper function để phân vùng miền
function getRegionByProvinceName(provinceName: string): 'bac-bo' | 'trung-bo' | 'nam-bo' {
  const bacBo = [
    'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Giang', 'Phú Thọ', 'Vĩnh Phúc', 
    'Bắc Ninh', 'Hải Dương', 'Hưng Yên', 'Thái Bình', 'Hà Nam', 'Nam Định',
    'Ninh Bình', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Cao Bằng', 'Bắc Kạn',
    'Tuyên Quang', 'Lào Cai', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Yên Bái',
    'Hoà Bình', 'Thái Nguyên', 'Lạng Sơn', 'Hà Giang'
  ];

  const trungBo = [
    'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam', 
    'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 
    'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ];

  // Check exact match first
  if (bacBo.includes(provinceName)) return 'bac-bo';
  if (trungBo.includes(provinceName)) return 'trung-bo';
  
  // Default to nam-bo for southern provinces
  return 'nam-bo';
}