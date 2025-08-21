// src/__tests__/auth.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { roleHelpers } from '../lib/auth';

describe('Auth Helpers', () => {
  describe('Role Helpers', () => {
    const mockClaims = {
      traveler: { role: 'traveler', verifiedContributor: false },
      contributor: { role: 'contributor', verifiedContributor: true },
      partner: { role: 'partner', verifiedContributor: false, partnerId: 'partner-123' },
      moderator: { role: 'moderator', verifiedContributor: true },
      admin: { role: 'admin', verifiedContributor: true }
    };

    it('should correctly identify user roles', () => {
      expect(roleHelpers.isGuest(null)).toBe(true);
      expect(roleHelpers.isGuest(undefined)).toBe(true);
      
      expect(roleHelpers.isTraveler(mockClaims.traveler)).toBe(true);
      expect(roleHelpers.isTraveler(mockClaims.admin)).toBe(false);
      
      expect(roleHelpers.isContributor(mockClaims.contributor)).toBe(true);
      expect(roleHelpers.isContributor(mockClaims.traveler)).toBe(false);
      
      expect(roleHelpers.isPartner(mockClaims.partner)).toBe(true);
      expect(roleHelpers.isPartner(mockClaims.contributor)).toBe(false);
      
      expect(roleHelpers.isModerator(mockClaims.moderator)).toBe(true);
      expect(roleHelpers.isModerator(mockClaims.admin)).toBe(true); // Admin có quyền moderator
      expect(roleHelpers.isModerator(mockClaims.traveler)).toBe(false);
      
      expect(roleHelpers.isAdmin(mockClaims.admin)).toBe(true);
      expect(roleHelpers.isAdmin(mockClaims.moderator)).toBe(false);
    });

    it('should check verified contributor status', () => {
      expect(roleHelpers.isVerifiedContributor(mockClaims.contributor)).toBe(true);
      expect(roleHelpers.isVerifiedContributor(mockClaims.traveler)).toBe(false);
      expect(roleHelpers.isVerifiedContributor(mockClaims.partner)).toBe(false);
    });

    it('should check place creation permissions', () => {
      expect(roleHelpers.canCreatePlace(mockClaims.traveler)).toBe(false);
      expect(roleHelpers.canCreatePlace(mockClaims.contributor)).toBe(true);
      expect(roleHelpers.canCreatePlace(mockClaims.partner)).toBe(true);
      expect(roleHelpers.canCreatePlace(mockClaims.moderator)).toBe(true);
      expect(roleHelpers.canCreatePlace(mockClaims.admin)).toBe(true);
    });

    it('should check moderation permissions', () => {
      expect(roleHelpers.canModerate(mockClaims.traveler)).toBe(false);
      expect(roleHelpers.canModerate(mockClaims.contributor)).toBe(false);
      expect(roleHelpers.canModerate(mockClaims.partner)).toBe(false);
      expect(roleHelpers.canModerate(mockClaims.moderator)).toBe(true);
      expect(roleHelpers.canModerate(mockClaims.admin)).toBe(true);
    });

    it('should check admin access permissions', () => {
      expect(roleHelpers.canAccessAdmin(mockClaims.traveler)).toBe(false);
      expect(roleHelpers.canAccessAdmin(mockClaims.moderator)).toBe(false);
      expect(roleHelpers.canAccessAdmin(mockClaims.admin)).toBe(true);
    });

    it('should check email verification requirement', () => {
      const verifiedUser = { emailVerified: true } as any;
      const unverifiedUser = { emailVerified: false } as any;
      
      expect(roleHelpers.requiresEmailVerification(verifiedUser)).toBe(false);
      expect(roleHelpers.requiresEmailVerification(unverifiedUser)).toBe(true);
      expect(roleHelpers.requiresEmailVerification(null)).toBe(false);
    });
  });
});


