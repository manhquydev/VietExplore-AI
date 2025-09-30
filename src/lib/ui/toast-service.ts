/**
 * Toast Service - Singleton Pattern
 * Centralized toast notification management
 *
 * Features:
 * - Type-safe API
 * - Observer pattern for React integration
 * - Queue management
 * - Deduplication
 * - Error boundaries
 */

import type {
  ToastMessage,
  ToastOptions,
  ToastListener,
  ToastQueueConfig,
  ToastVariant,
} from './toast-types'
import { DEFAULT_TOAST_CONFIG } from './toast-types'

class ToastService {
  private static instance: ToastService
  private listeners: Set<ToastListener> = new Set()
  private toastQueue: ToastMessage[] = []
  private config: ToastQueueConfig = DEFAULT_TOAST_CONFIG
  private idCounter = 0

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Enable debug logging in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).__toastService = this
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService()
    }
    return ToastService.instance
  }

  /**
   * Subscribe to toast events
   */
  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Unsubscribe from toast events
   */
  public unsubscribe(listener: ToastListener): void {
    this.listeners.delete(listener)
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${++this.idCounter}`
  }

  /**
   * Check if similar toast already exists (for deduplication)
   */
  private isDuplicate(title: string, description?: string): boolean {
    if (!this.config.deduplication) return false

    const recentToasts = this.toastQueue.filter(
      (t) => Date.now() - t.timestamp < 2000 // Check last 2 seconds
    )

    return recentToasts.some(
      (t) => t.title === title && t.description === description
    )
  }

  /**
   * Add toast to queue and notify listeners
   */
  private addToast(
    title: string,
    description: string | undefined,
    variant: ToastVariant,
    options?: ToastOptions
  ): void {
    try {
      // Check for duplicates
      if (options?.preventDuplicates !== false && this.isDuplicate(title, description)) {
        console.debug('[ToastService] Duplicate toast prevented:', title)
        return
      }

      const toast: ToastMessage = {
        id: this.generateId(),
        title,
        description,
        variant,
        duration: options?.duration ?? this.config.defaultDuration,
        action: options?.action,
        timestamp: Date.now(),
      }

      // Add to queue
      this.toastQueue.push(toast)

      // Limit queue size
      if (this.toastQueue.length > this.config.maxToasts * 2) {
        this.toastQueue = this.toastQueue.slice(-this.config.maxToasts * 2)
      }

      // Notify all listeners
      this.notify(toast)

      // Auto-remove from queue after duration
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.removeFromQueue(toast.id)
        }, toast.duration + 1000) // Extra 1s for animation
      }
    } catch (error) {
      // Fallback to console if toast system fails
      console.error('[ToastService] Failed to show toast:', error)
      console.log(`[${variant.toUpperCase()}] ${title}`, description)
    }
  }

  /**
   * Remove toast from queue
   */
  private removeFromQueue(id: string): void {
    this.toastQueue = this.toastQueue.filter((t) => t.id !== id)
  }

  /**
   * Notify all listeners
   */
  private notify(toast: ToastMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(toast)
      } catch (error) {
        console.error('[ToastService] Listener error:', error)
      }
    })
  }

  /**
   * Show success toast (green)
   */
  public success(title: string, description?: string, options?: ToastOptions): void {
    this.addToast(title, description, 'success', options)
  }

  /**
   * Show error toast (red)
   */
  public error(title: string, description?: string, options?: ToastOptions): void {
    this.addToast(title, description, 'destructive', options)
  }

  /**
   * Show warning toast (yellow)
   */
  public warning(title: string, description?: string, options?: ToastOptions): void {
    this.addToast(title, description, 'warning', options)
  }

  /**
   * Show info toast (blue)
   */
  public info(title: string, description?: string, options?: ToastOptions): void {
    this.addToast(title, description, 'info', options)
  }

  /**
   * Show default toast
   */
  public show(title: string, description?: string, options?: ToastOptions): void {
    this.addToast(title, description, 'default', options)
  }

  /**
   * Clear all toasts
   */
  public clearAll(): void {
    this.toastQueue = []
  }

  /**
   * Get current queue (for debugging)
   */
  public getQueue(): ReadonlyArray<ToastMessage> {
    return [...this.toastQueue]
  }

  /**
   * Update configuration
   */
  public configure(config: Partial<ToastQueueConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<ToastQueueConfig> {
    return { ...this.config }
  }
}

/**
 * Export singleton instance
 */
export const toastService = ToastService.getInstance()

/**
 * Export class for testing purposes
 */
export { ToastService }

/**
 * Development helper
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[ToastService] Initialized and ready')
}