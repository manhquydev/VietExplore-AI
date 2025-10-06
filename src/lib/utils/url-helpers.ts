/**
 * Professional URL Management System for Du Lịch Việt
 * Hybrid approach: slug + short ID for uniqueness and SEO
 */

/**
 * Generate SEO-friendly compound URL
 * Format: /places/{slug}-{shortId}
 * Example: /places/bien-vo-cuc-z9H5Lt
 */
export function generatePlaceUrl(place: { slug?: string; name: string; id: string }): string {
  // Use existing slug or generate from name
  const slug = place.slug || generateSlugFromName(place.name);
  
  // Get last 6 characters of Firebase ID for uniqueness
  const shortId = place.id.slice(-6);
  
  return `/places/${slug}-${shortId}`;
}

/**
 * Generate slug from place name
 * Convert Vietnamese text to URL-friendly slug
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd') // Handle special case
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple consecutive hyphens
    .substring(0, 50); // Limit length
}

/**
 * Parse compound URL to extract ID
 * Input: bien-vo-cuc-z9H5Lt → Output: full Firebase ID
 */
export function parseCompoundUrl(compoundSlug: string, allPlaceIds: string[]): string | null {
  // Check if it's already a Firebase ID (fallback for old URLs)
  if (compoundSlug.match(/^[a-zA-Z0-9]{20}$/)) {
    return compoundSlug;
  }
  
  // Extract short ID from compound slug
  const parts = compoundSlug.split('-');
  if (parts.length < 2) return null;
  
  const shortId = parts[parts.length - 1];
  if (shortId.length !== 6) return null;
  
  // Find matching Firebase ID
  const matchingId = allPlaceIds.find(id => id.endsWith(shortId));
  return matchingId || null;
}

/**
 * Validate if URL format is correct
 */
export function isValidPlaceUrl(url: string): boolean {
  // Support both compound format and Firebase ID format
  return /^[a-z0-9-]+-[a-zA-Z0-9]{6}$/.test(url) || /^[a-zA-Z0-9]{20}$/.test(url);
}

/**
 * Migrate old ID-only URLs to compound format
 * This happens at component level, not middleware level
 */
export function shouldMigrateUrl(currentUrl: string): boolean {
  return /^[a-zA-Z0-9]{20}$/.test(currentUrl);
}

/**
 * Generate canonical URL for SEO
 */
export function getCanonicalPlaceUrl(place: { slug?: string; name: string; id: string }, baseUrl: string): string {
  const placeUrl = generatePlaceUrl(place);
  return `${baseUrl}${placeUrl}`;
}

/**
 * Extract display name from compound URL for breadcrumbs
 */
export function getDisplayNameFromUrl(compoundSlug: string): string {
  if (compoundSlug.match(/^[a-zA-Z0-9]{20}$/)) {
    return ''; // Cannot extract from Firebase ID
  }
  
  const parts = compoundSlug.split('-');
  // Remove the last part (shortId) and rejoin
  const nameSlug = parts.slice(0, -1).join('-');
  
  // Convert back to readable format
  return nameSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}