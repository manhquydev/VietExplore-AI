/**
 * Toast System Type Definitions
 * Centralized type definitions for toast notifications
 */

import type { ToastActionElement } from "@/components/ui/toast"

/**
 * Toast variant types matching the UI component variants
 */
export type ToastVariant = "default" | "destructive" | "success" | "warning" | "info"

/**
 * Toast message structure
 */
export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: ToastActionElement
  timestamp: number
}

/**
 * Options for toast notifications
 */
export interface ToastOptions {
  /**
   * Duration in milliseconds (default: 5000)
   */
  duration?: number

  /**
   * Action button for the toast
   */
  action?: ToastActionElement

  /**
   * Prevent duplicate toasts with same title
   */
  preventDuplicates?: boolean
}

/**
 * Listener function type for toast events
 */
export type ToastListener = (toast: ToastMessage) => void

/**
 * Toast queue configuration
 */
export interface ToastQueueConfig {
  /**
   * Maximum number of toasts to show at once
   */
  maxToasts: number

  /**
   * Default duration for toasts (ms)
   */
  defaultDuration: number

  /**
   * Enable deduplication
   */
  deduplication: boolean
}

/**
 * Default toast configuration
 */
export const DEFAULT_TOAST_CONFIG: ToastQueueConfig = {
  maxToasts: 3,
  defaultDuration: 5000,
  deduplication: true,
}