// functions/src/utils/validation.ts
export const validation = {
  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Domain validation
  isBannedDomain(email: string): boolean {
    const bannedDomains = [
      'mailinator.com',
      'tempmail.com', 
      'guerrillamail.com',
      '10minutemail.com',
      'temp-mail.org',
      'throwaway.email',
      'maildrop.cc'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? bannedDomains.includes(domain) : false;
  },

  // Role validation
  isValidRole(role: string): boolean {
    const validRoles = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
    return validRoles.includes(role);
  },

  // Permission checking
  hasPermission(userRole: string, action: string): boolean {
    const permissions = {
      'traveler': ['read_places', 'create_itinerary', 'report_content'],
      'contributor': ['read_places', 'create_itinerary', 'create_place_draft', 'report_content'],
      'partner': ['read_places', 'create_itinerary', 'create_place_draft', 'fast_track', 'report_content'],
      'moderator': ['read_places', 'create_itinerary', 'create_place_draft', 'moderate_content', 'review_reports'],
      'admin': ['read_places', 'create_itinerary', 'create_place_draft', 'moderate_content', 'review_reports', 'manage_users', 'manage_system']
    };

    return permissions[userRole as keyof typeof permissions]?.includes(action) || false;
  },

  // Rate limiting helpers
  isRateLimited(tracker: Map<string, number[]>, key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requests = tracker.get(key) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return true;
    }
    
    // Update tracker
    recentRequests.push(now);
    tracker.set(key, recentRequests);
    return false;
  },

  // Content validation (theo Tài liệu 2)
  isValidPlaceData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Title validation (50-120 ký tự)
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Tên địa điểm phải có ít nhất 3 ký tự');
    }
    if (data.title && data.title.length > 120) {
      errors.push('Tên địa điểm không được quá 120 ký tự');
    }
    
    // Description validation (80-400 từ cho lean)
    if (!data.description || data.description.trim().length < 50) {
      errors.push('Mô tả phải có ít nhất 50 ký tự');
    }
    if (data.description && data.description.length > 2000) {
      errors.push('Mô tả không được quá 2000 ký tự');
    }
    
    // Region validation
    if (!data.region || !['bac-bo', 'trung-bo', 'nam-bo'].includes(data.region)) {
      errors.push('Vùng không hợp lệ (bac-bo, trung-bo, nam-bo)');
    }
    
    // Province validation
    if (!data.province || data.province.trim().length === 0) {
      errors.push('Tỉnh/thành là bắt buộc');
    }
    
    // Type validation
    if (!data.type || !['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in'].includes(data.type)) {
      errors.push('Loại địa điểm không hợp lệ');
    }
    
    // Sources validation
    if (!data.sources || !Array.isArray(data.sources) || data.sources.length === 0) {
      errors.push('Phải có ít nhất 1 nguồn tham khảo');
    }
    
    // Photos validation (3-5 ảnh)
    if (data.photos && Array.isArray(data.photos)) {
      if (data.photos.length > 5) {
        errors.push('Không được quá 5 ảnh');
      }
      
      for (const photo of data.photos) {
        if (!photo.path || !photo.credit) {
          errors.push('Mỗi ảnh phải có đường dẫn và credit');
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Itinerary validation
  isValidItineraryData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length < 5) {
      errors.push('Tiêu đề lịch trình phải có ít nhất 5 ký tự');
    }
    
    if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
      errors.push('Lịch trình phải có ít nhất 1 ngày');
    }
    
    if (data.days && data.days.length > 30) {
      errors.push('Lịch trình không được quá 30 ngày');
    }
    
    return { valid: errors.length === 0, errors };
  }
};

