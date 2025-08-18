import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Whitelist icon được phép theo DLV-ICON-POLICY
export type IconName =
  // Navigation & UI Core
  | "chevron-left" | "chevron-right" | "menu" | "close"
  // Search & Input
  | "search" | "calendar" | "location" | "filter"
  // Actions (Core only)
  | "plus" | "heart" | "share" | "save"
  // Status & Feedback
  | "check" | "alert" | "star"
  // Auth & User
  | "user" | "eye" | "eye-off"
  // Dark mode
  | "sun" | "moon"
  // Essential admin/moderation icons
  | "shield" | "settings" | "users" | "flag" | "clock" | "edit" 
  | "check-circle" | "x-circle" | "alert-circle" | "trash-2" | "more-horizontal"
  | "camera" | "map" | "sparkles" | "activity" | "bar-chart" | "zap"
  | "shield-check" | "user-plus" | "user-x" | "server" | "alert-triangle"
  // Social icons
  | "facebook" | "mail" | "github"
  // Additional UI icons
  | "chevron-down";

const iconPaths: Record<IconName, JSX.Element> = {
  // Navigation
  "chevron-left": <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-right": <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "menu": <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />,
  "close": <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  
  // Search & Input
  "search": (
    <>
      <circle cx="11" cy="11" r="8" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "calendar": (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
    </>
  ),
  "location": <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" strokeWidth="2" fill="none"/>,
  "filter": <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" strokeWidth="2" fill="none"/>,
  
  // Actions
  "plus": <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>,
  "heart": <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" fill="none"/>,
  "share": <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "save": <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Status
  "check": <polyline points="20,6 9,17 4,12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "alert": <path d="M12 9v4M12 17h.01 M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "star": <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeWidth="2" fill="none"/>,
  
  // Auth & User
  "user": <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "eye": <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" strokeWidth="2" fill="none"/>,
  "eye-off": (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  
  // Theme
  "sun": (
    <>
      <circle cx="12" cy="12" r="5" strokeWidth="2"/>
      <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round"/>
      <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "moon": <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Admin & Moderation
  "shield": <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "settings": (
    <>
      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5l-4.5 4.5m0-9l4.5 4.5m-9-4.5l-4.5 4.5m4.5 4.5l-4.5-4.5" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "users": <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "flag": <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "clock": (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <polyline points="12,6 12,12 16,14" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "edit": <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "check-circle": <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "trash-2": (
    <>
      <polyline points="3,6 5,6 21,6" strokeWidth="2"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "more-horizontal": (
    <>
      <circle cx="12" cy="12" r="1" strokeWidth="2"/>
      <circle cx="19" cy="12" r="1" strokeWidth="2"/>
      <circle cx="5" cy="12" r="1" strokeWidth="2"/>
    </>
  ),
  "camera": <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "map": <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "sparkles": <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" strokeWidth="2"/>,
  "activity": <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "bar-chart": (
    <>
      <line x1="12" y1="20" x2="12" y2="10" strokeWidth="2"/>
      <line x1="18" y1="20" x2="18" y2="4" strokeWidth="2"/>
      <line x1="6" y1="20" x2="6" y2="16" strokeWidth="2"/>
    </>
  ),
  "zap": <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "shield-check": <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "user-plus": <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M12.5 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z M20 8v6 M23 11h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "user-x": <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M12.5 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z M18 8l5 5 M23 8l-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "server": (
    <>
      <rect x="2" y="3" width="20" height="3" rx="1" strokeWidth="2"/>
      <rect x="2" y="10" width="20" height="3" rx="1" strokeWidth="2"/>
      <rect x="2" y="17" width="20" height="3" rx="1" strokeWidth="2"/>
      <line x1="6" y1="4.5" x2="6.01" y2="4.5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="11.5" x2="6.01" y2="11.5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="18.5" x2="6.01" y2="18.5" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "alert-triangle": <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Social
  "facebook": <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "mail": <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  "github": <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Additional UI
  "chevron-down": <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
};

interface IconProps {
  name: IconName;
  size?: 20 | 24; // Chỉ cho phép 2 size chuẩn
  className?: string;
  title?: string; // A11y: mô tả ngắn
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 20, className = "text-muted", title },
  ref
) {
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={title || name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("inline-block align-middle flex-shrink-0", className)}
      fill="none"
      stroke="currentColor"
    >
      {iconPaths[name]}
    </svg>
  );
});

// Helper component cho icon buttons với proper hit area
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string; // Bắt buộc có label cho a11y
  size?: 20 | 24;
  variant?: "default" | "ghost";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 20, variant = "default", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "min-w-[44px] min-h-[44px]", // Touch target minimum
        variant === "default" && "bg-surface hover:bg-border",
        variant === "ghost" && "hover:bg-surface",
        className
      )}
      aria-label={label}
      {...props}
    >
      <Icon name={icon} size={size} className="text-muted hover:text-text" />
    </button>
  );
});
