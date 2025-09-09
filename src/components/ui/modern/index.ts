/**
 * Enhanced Modern UI Components Library 2025 - VietExplore AI Admin
 * Professional component exports for consistent admin interface
 */

// Legacy Components (backward compatibility)
export * from './card'
export * from './button' 
export * from './badge'

// Enhanced Modern Components 2025
export { EnhancedCard, CardHeader, CardContent, CardFooter } from './enhanced-card'
export { EnhancedButton, ButtonGroup } from './enhanced-button'
export { EnhancedDataTable } from './enhanced-data-table'

// Theme Integration
export { useEnhancedTheme } from '@/providers/enhanced-theme-provider'

// Re-export for easy access
export { designSystem } from '@/lib/design-system'