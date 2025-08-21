// functions/src/utils/slugHelpers.ts
import * as admin from 'firebase-admin';

export const slugHelpers = {
  // Generate slug từ Vietnamese text
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (á -> a, ê -> e)
      .replace(/đ/g, 'd') // Replace đ
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 120); // Max length
  },

  // Kiểm tra slug có tồn tại không
  async isSlugExists(slug: string, collection: string = 'places'): Promise<boolean> {
    const db = admin.firestore();
    const snapshot = await db.collection(collection)
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  },

  // Generate unique slug
  async generateUniqueSlug(title: string, collection: string = 'places'): Promise<string> {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.isSlugExists(slug, collection)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loop
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }
    
    return slug;
  },

  // Validate slug format
  isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && 
           slug.length > 0 && 
           slug.length <= 120 &&
           !slug.startsWith('-') &&
           !slug.endsWith('-') &&
           !slug.includes('--');
  },

  // Suggest alternative slugs
  suggestAlternativeSlug(originalSlug: string): string[] {
    const suggestions = [
      `${originalSlug}-moi`,
      `${originalSlug}-dep`,
      `${originalSlug}-noi-tieng`,
      `${originalSlug}-${new Date().getFullYear()}`,
      `${originalSlug}-vn`
    ];

    return suggestions.filter(s => this.isValidSlug(s));
  },

  // Extract slug from URL or path
  extractSlugFromPath(path: string): string | null {
    const match = path.match(/\/([a-z0-9-]+)\/?$/);
    return match ? match[1] : null;
  },

  // Province code mapping (Vietnamese provinces)
  getProvinceCode(provinceName: string): string {
    const provinceMap: { [key: string]: string } = {
      'Hà Nội': 'ha-noi',
      'Hồ Chí Minh': 'ho-chi-minh',
      'Đà Nẵng': 'da-nang',
      'Hải Phòng': 'hai-phong',
      'Cần Thơ': 'can-tho',
      'Quảng Ninh': 'quang-ninh',
      'Lào Cai': 'lao-cai',
      'Điện Biên': 'dien-bien',
      'Lai Châu': 'lai-chau',
      'Sơn La': 'son-la',
      'Yên Bái': 'yen-bai',
      'Hoà Bình': 'hoa-binh',
      'Thái Nguyên': 'thai-nguyen',
      'Lạng Sơn': 'lang-son',
      'Cao Bằng': 'cao-bang',
      'Bắc Kạn': 'bac-kan',
      'Hà Giang': 'ha-giang',
      'Tuyên Quang': 'tuyen-quang',
      'Phú Thọ': 'phu-tho',
      'Vĩnh Phúc': 'vinh-phuc',
      'Bắc Ninh': 'bac-ninh',
      'Bắc Giang': 'bac-giang',
      'Hải Dương': 'hai-duong',
      'Hưng Yên': 'hung-yen',
      'Hà Nam': 'ha-nam',
      'Nam Định': 'nam-dinh',
      'Thái Bình': 'thai-binh',
      'Ninh Bình': 'ninh-binh',
      'Thanh Hóa': 'thanh-hoa',
      'Nghệ An': 'nghe-an',
      'Hà Tĩnh': 'ha-tinh',
      'Quảng Bình': 'quang-binh',
      'Quảng Trị': 'quang-tri',
      'Thừa Thiên Huế': 'thua-thien-hue',
      'Quảng Nam': 'quang-nam',
      'Quảng Ngãi': 'quang-ngai',
      'Bình Định': 'binh-dinh',
      'Phú Yên': 'phu-yen',
      'Khánh Hòa': 'khanh-hoa',
      'Ninh Thuận': 'ninh-thuan',
      'Bình Thuận': 'binh-thuan',
      'Kon Tum': 'kon-tum',
      'Gia Lai': 'gia-lai',
      'Đắk Lắk': 'dak-lak',
      'Đắk Nông': 'dak-nong',
      'Lâm Đồng': 'lam-dong',
      'Bình Phước': 'binh-phuoc',
      'Tây Ninh': 'tay-ninh',
      'Bình Dương': 'binh-duong',
      'Đồng Nai': 'dong-nai',
      'Bà Rịa - Vũng Tàu': 'ba-ria-vung-tau',
      'Long An': 'long-an',
      'Tiền Giang': 'tien-giang',
      'Bến Tre': 'ben-tre',
      'Trà Vinh': 'tra-vinh',
      'Vĩnh Long': 'vinh-long',
      'Đồng Tháp': 'dong-thap',
      'An Giang': 'an-giang',
      'Kiên Giang': 'kien-giang',
      'Cà Mau': 'ca-mau',
      'Hậu Giang': 'hau-giang',
      'Sóc Trăng': 'soc-trang'
    };

    return provinceMap[provinceName] || provinceName.toLowerCase().replace(/\s+/g, '-');
  }
};

