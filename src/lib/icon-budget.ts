// Icon Budget Tracker theo DLV-ICON-POLICY

export const ICON_BUDGET = {
  // Landing/Marketing pages
  homepage: 6,
  about: 6,
  
  // List pages
  places_list: 4, // 1 icon per card max
  itineraries_list: 4,
  
  // Detail pages
  place_detail: 8,
  itinerary_detail: 8,
  
  // Forms
  contribute_form: 6,
  
  // Dashboards
  moderation: 10, // Admin tools can have more
} as const

export type PageType = keyof typeof ICON_BUDGET

// Development helper to count icons in a component
export function countIcons(componentHTML: string): number {
  // Count SVG elements (our Icon components render as SVG)
  const svgMatches = componentHTML.match(/<svg[^>]*>/g) || []
  // Count lucide-react imports
  const iconImports = componentHTML.match(/from ['"]lucide-react['"]/g) || []
  
  return svgMatches.length + iconImports.length
}

// Validation helper
export function validateIconBudget(pageType: PageType, iconCount: number): {
  isValid: boolean
  budget: number
  current: number
  message: string
} {
  const budget = ICON_BUDGET[pageType]
  const isValid = iconCount <= budget
  
  return {
    isValid,
    budget,
    current: iconCount,
    message: isValid 
      ? `✅ Icon budget OK: ${iconCount}/${budget}`
      : `❌ Icon budget exceeded: ${iconCount}/${budget} (+${iconCount - budget})`
  }
}

// Recommended replacements
export const ICON_REPLACEMENTS = {
  // Decorative icons → Remove or replace with text
  "decorative_location": "Text: địa điểm, tỉnh/thành",
  "decorative_time": "Badge: '3 ngày 2 đêm'",
  "decorative_price": "Text: giá tiền với VND",
  "decorative_info": "Help text dưới input",
  
  // Multiple icons in one action → Consolidate
  "multiple_social": "Giới hạn 3 social links",
  "icon_spam_in_card": "1 action icon per card max",
  
  // Navigation icons → Keep only essential
  "keep_hamburger": "✅ Essential for mobile",
  "keep_chevron": "✅ Essential for carousels",
  "keep_close": "✅ Essential for modals",
  
  // Form icons → Only in input fields
  "keep_search_in_input": "✅ Search icon in search box",
  "keep_calendar_in_input": "✅ Calendar icon for date picker",
  "remove_label_icons": "❌ Remove icons before form labels",
} as const

