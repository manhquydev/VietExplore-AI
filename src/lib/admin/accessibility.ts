/**
 * Du Lịch Việt AI - Admin Accessibility Utilities
 * WCAG 2.1 AA compliance helpers and focus management
 */

import * as React from "react"

// === FOCUS MANAGEMENT ===

/**
 * Trap focus within a container element
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        container.dispatchEvent(new CustomEvent('focustrap:escape'))
      }
    }

    // Focus first element when trap becomes active
    firstElement?.focus()

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive])

  return containerRef
}

/**
 * Restore focus to previous element when component unmounts
 */
export const useFocusReturn = () => {
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    // Store current focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    return () => {
      // Restore focus on cleanup
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [])

  return previousFocusRef
}

/**
 * Skip to main content link for screen readers
 */
export const AdminSkipLink = () => {
  return React.createElement('a', {
    href: '#main-content',
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 admin-btn-primary admin-btn-sm'
  }, 'Chuyển đến nội dung chính')
}

// === ARIA UTILITIES ===

/**
 * Generate unique IDs for ARIA relationships
 */
export const useId = (prefix = 'admin') => {
  const [id] = React.useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  return id
}

/**
 * Announce messages to screen readers
 */
export const useScreenReaderAnnouncer = () => {
  const announcerRef = React.useRef<HTMLDivElement>(null)

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return

    announcerRef.current.setAttribute('aria-live', priority)
    announcerRef.current.textContent = message

    // Clear message after announcement
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  const AnnouncerComponent = React.useCallback(() => 
    React.createElement('div', {
      ref: announcerRef,
      className: 'sr-only',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    })
  , [])

  return { announce, AnnouncerComponent }
}

// === KEYBOARD NAVIGATION ===

/**
 * Handle keyboard navigation for lists/grids
 */
export const useKeyboardNavigation = (
  itemsCount: number,
  onItemSelect?: (index: number) => void
) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0)

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, itemsCount - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(itemsCount - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onItemSelect?.(focusedIndex)
        break
    }
  }, [itemsCount, focusedIndex, onItemSelect])

  return { focusedIndex, handleKeyDown, setFocusedIndex }
}

// === COLOR CONTRAST ===

/**
 * Check if color combination meets WCAG AA standards
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const sRGB = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export const meetsContrastRequirement = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

// === ACCESSIBLE COMPONENTS ===

/**
 * Screen reader only text component
 */
export const AdminSROnly = ({ children }: { children: React.ReactNode }) => 
  React.createElement('span', { className: 'sr-only' }, children)

/**
 * Accessible status indicator with screen reader text
 */
export interface AdminStatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info'
  label: string
  className?: string
}

export const AdminStatusIndicator = ({ status, label, className }: AdminStatusIndicatorProps) => {
  const statusClasses = {
    success: 'bg-admin-success-600',
    warning: 'bg-admin-warning-600', 
    error: 'bg-admin-error-600',
    info: 'bg-admin-info-600'
  }

  return React.createElement('div', 
    { className: `inline-flex items-center gap-2 ${className}` },
    React.createElement('div', {
      className: `h-2 w-2 rounded-full ${statusClasses[status]}`,
      role: 'img',
      'aria-label': `Trạng thái: ${label}`
    }),
    React.createElement(AdminSROnly, null, `Trạng thái: ${label}`)
  )
}

/**
 * Accessible loading spinner with proper labeling
 */
export const AdminAccessibleSpinner = ({ 
  label = "Đang tải...",
  size = 'base' 
}: { 
  label?: string
  size?: 'sm' | 'base' | 'lg'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    base: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return React.createElement('div', {
    className: `animate-spin rounded-full border-2 border-admin-neutral-300 border-t-admin-primary-600 ${sizeClasses[size]}`,
    role: 'status',
    'aria-label': label
  }, React.createElement(AdminSROnly, null, label))
}

// === FORM ACCESSIBILITY ===

/**
 * Accessible form field wrapper with proper labeling and error handling
 */
export interface AdminFormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
}

export const AdminFormField = ({
  id,
  label,
  error,
  required = false,
  description,
  children
}: AdminFormFieldProps) => {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return React.createElement('div', { className: 'space-y-2' },
    React.createElement('label', 
      { htmlFor: id, className: 'admin-body-text font-semibold' },
      label,
      required && React.createElement('span', {
        className: 'text-admin-error-600 ml-1',
        'aria-label': 'bắt buộc'
      }, '*')
    ),
    description && React.createElement('p', {
      id: descriptionId,
      className: 'admin-caption-text'
    }, description),
    React.createElement('div', null,
      React.cloneElement(children as React.ReactElement, {
        id,
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' '),
        'aria-invalid': !!error,
        required
      })
    ),
    error && React.createElement('p', {
      id: errorId,
      className: 'admin-caption-text text-admin-error-700',
      role: 'alert'
    }, error)
  )
}

// === EXPORT ALL ===
export const adminAccessibility = {
  useFocusTrap,
  useFocusReturn,
  useId,
  useScreenReaderAnnouncer,
  useKeyboardNavigation,
  getContrastRatio,
  meetsContrastRequirement,
  AdminSkipLink,
  AdminSROnly,
  AdminStatusIndicator,
  AdminAccessibleSpinner,
  AdminFormField
}

export default adminAccessibility