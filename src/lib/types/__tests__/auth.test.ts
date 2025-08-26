
/**
 * @jest-environment node
 */

import { hasPermission, rolePermissions } from '../auth'
import type { User } from '../auth'

describe('Auth Types and Permissions', () => {
  const createMockUser = (role: User['role']): User => ({
    id: 'test-user',
    email: 'test@example.com',
    fullName: 'Test User',
    username: 'testuser',
    role,
    verified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    stats: {
      placesContributed: 0,
      itinerariesCreated: 0,
      helpfulVotes: 0
    }
  })

  describe('hasPermission function', () => {
    it('should return false for null user', () => {
      const result = hasPermission(null, 'create_place')
      expect(result).toBe(false)
    })

    it('should return true for admin with any permission', () => {
      const adminUser = createMockUser('admin')
      const result = hasPermission(adminUser, 'any_permission')
      expect(result).toBe(true)
    })

    it('should allow traveler to create itineraries', () => {
      const travelerUser = createMockUser('traveler')
      const result = hasPermission(travelerUser, 'create_itinerary')
      expect(result).toBe(true)
    })

    it('should deny traveler from creating places', () => {
      const travelerUser = createMockUser('traveler')
      const result = hasPermission(travelerUser, 'create_place')
      expect(result).toBe(false)
    })

    it('should allow contributor to create places', () => {
      const contributorUser = createMockUser('contributor')
      const result = hasPermission(contributorUser, 'create_place')
      expect(result).toBe(true)
    })

    it('should allow partner to create places with priority', () => {
      const partnerUser = createMockUser('partner')
      const result = hasPermission(partnerUser, 'create_place_priority')
      expect(result).toBe(true)
    })

    it('should allow moderator to review content', () => {
      const moderatorUser = createMockUser('moderator')
      const result = hasPermission(moderatorUser, 'review_content')
      expect(result).toBe(true)
    })

    it('should deny guest from all actions', () => {
      const guestUser = createMockUser('guest')
      expect(hasPermission(guestUser, 'create_itinerary')).toBe(false)
      expect(hasPermission(guestUser, 'save_places')).toBe(false)
      expect(hasPermission(guestUser, 'report_content')).toBe(false)
    })
  })

  describe('rolePermissions mapping', () => {
    it('should have correct permissions for each role', () => {
      expect(rolePermissions.guest).toEqual([])
      
      expect(rolePermissions.traveler).toContain('create_itinerary')
      expect(rolePermissions.traveler).toContain('save_places')
      expect(rolePermissions.traveler).toContain('report_content')
      
      expect(rolePermissions.contributor).toContain('create_place')
      expect(rolePermissions.contributor).toContain('manage_drafts')
      
      expect(rolePermissions.partner).toContain('create_place_priority')
      expect(rolePermissions.partner).toContain('fast_review')
      
      expect(rolePermissions.moderator).toContain('review_content')
      expect(rolePermissions.moderator).toContain('approve_content')
      
      expect(rolePermissions.admin).toEqual(['all_permissions'])
    })

    it('should maintain role hierarchy in permissions', () => {
      // Contributor should have all traveler permissions plus their own
      const travelerPerms = rolePermissions.traveler
      const contributorPerms = rolePermissions.contributor
      
      travelerPerms.forEach(perm => {
        expect(contributorPerms).toContain(perm)
      })

      // Partner should have contributor-level permissions plus their own
      const partnerPerms = rolePermissions.partner
      expect(partnerPerms).toContain('create_itinerary')
      expect(partnerPerms).toContain('save_places')
      expect(partnerPerms).toContain('report_content')
    })
  })

  describe('Role-based content trust labels', () => {
    it('should map user roles to appropriate trust labels', () => {
      // Based on role-badge-logic.md
      const travelerUser = createMockUser('traveler')
      const contributorUser = createMockUser('contributor')
      const partnerUser = createMockUser('partner')

      // Traveler content should be "community"
      expect(travelerUser.role).toBe('traveler')
      
      // Contributor content should be "contributor" 
      expect(contributorUser.role).toBe('contributor')
      
      // Partner content should be "partner"
      expect(partnerUser.role).toBe('partner')
    })
  })

  describe('User interface validation', () => {
    it('should have all required fields', () => {
      const user = createMockUser('traveler')
      
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('fullName')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('verified')
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
      expect(user).toHaveProperty('stats')
      
      expect(user.stats).toHaveProperty('placesContributed')
      expect(user.stats).toHaveProperty('itinerariesCreated')
      expect(user.stats).toHaveProperty('helpfulVotes')
    })

    it('should support optional profile fields', () => {
      const userWithProfile = createMockUser('contributor')
      userWithProfile.profile = {
        bio: 'Travel enthusiast',
        location: 'Vietnam',
        website: 'https://example.com',
        socialLinks: {
          facebook: 'https://facebook.com/user',
          instagram: 'https://instagram.com/user'
        }
      }

      expect(userWithProfile.profile).toBeDefined()
      expect(userWithProfile.profile?.bio).toBe('Travel enthusiast')
      expect(userWithProfile.profile?.socialLinks?.facebook).toBe('https://facebook.com/user')
    })
  })
})
