// functions/src/__tests__/helpers.test.ts
import { validation } from '../utils/validation';

describe('Validation Helpers', () => {
  describe('Email Domain Validation', () => {
    it('should detect banned domains', () => {
      expect(validation.isBannedDomain('test@mailinator.com')).toBe(true);
      expect(validation.isBannedDomain('user@tempmail.com')).toBe(true);
      expect(validation.isBannedDomain('spam@guerrillamail.com')).toBe(true);
    });

    it('should allow valid domains', () => {
      expect(validation.isBannedDomain('user@gmail.com')).toBe(false);
      expect(validation.isBannedDomain('test@yahoo.com')).toBe(false);
      expect(validation.isBannedDomain('work@company.com')).toBe(false);
    });

    it('should validate email format', () => {
      expect(validation.isValidEmail('user@gmail.com')).toBe(true);
      expect(validation.isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(validation.isValidEmail('invalid-email')).toBe(false);
      expect(validation.isValidEmail('')).toBe(false);
      expect(validation.isValidEmail('user@')).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should validate roles correctly', () => {
      expect(validation.isValidRole('traveler')).toBe(true);
      expect(validation.isValidRole('admin')).toBe(true);
      expect(validation.isValidRole('invalid')).toBe(false);
      expect(validation.isValidRole('')).toBe(false);
    });
  });

  describe('Permission Checking', () => {
    it('should check traveler permissions', () => {
      expect(validation.hasPermission('traveler', 'read_places')).toBe(true);
      expect(validation.hasPermission('traveler', 'create_place_draft')).toBe(false);
      expect(validation.hasPermission('traveler', 'moderate_content')).toBe(false);
    });

    it('should check contributor permissions', () => {
      expect(validation.hasPermission('contributor', 'create_place_draft')).toBe(true);
      expect(validation.hasPermission('contributor', 'moderate_content')).toBe(false);
      expect(validation.hasPermission('contributor', 'manage_users')).toBe(false);
    });

    it('should check admin permissions', () => {
      expect(validation.hasPermission('admin', 'manage_users')).toBe(true);
      expect(validation.hasPermission('admin', 'moderate_content')).toBe(true);
      expect(validation.hasPermission('admin', 'create_place_draft')).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should validate place data', () => {
      const validPlace = {
        title: 'Hồ Hoàn Kiếm',
        description: 'Hồ Hoàn Kiếm là một hồ nước ngọt tự nhiên nằm ở trung tâm thành phố Hà Nội, Việt Nam. Đây là một trong những địa điểm du lịch nổi tiếng nhất của thủ đô.',
        region: 'bac-bo',
        province: 'ha-noi',
        type: 'van-hoa',
        sources: ['https://vi.wikipedia.org/wiki/Hồ_Hoàn_Kiếm']
      };

      const result = validation.isValidPlaceData(validPlace);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid place data', () => {
      const invalidPlace = {
        title: 'AB', // Too short
        description: 'Short desc', // Too short
        region: 'invalid-region',
        province: '',
        type: 'invalid-type',
        sources: [] // Empty sources
      };

      const result = validation.isValidPlaceData(invalidPlace);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should track and limit requests', () => {
      const tracker = new Map<string, number[]>();
      const key = 'test-ip';
      const maxRequests = 3;
      const windowMs = 60000; // 1 minute

      // First 3 requests should be allowed
      expect(validation.isRateLimited(tracker, key, maxRequests, windowMs)).toBe(false);
      expect(validation.isRateLimited(tracker, key, maxRequests, windowMs)).toBe(false);
      expect(validation.isRateLimited(tracker, key, maxRequests, windowMs)).toBe(false);

      // 4th request should be blocked
      expect(validation.isRateLimited(tracker, key, maxRequests, windowMs)).toBe(true);
    });
  });
});
