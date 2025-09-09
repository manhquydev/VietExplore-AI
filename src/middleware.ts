import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')
  
  if (cfConnecting) {
    return cfConnecting.trim()
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real.trim()
  }
  
  return request.ip || 'unknown'
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') || 
         pathname.startsWith('/api/admin') ||
         pathname.startsWith('/api/internal') ||
         pathname.startsWith('/_next') ||
         pathname.startsWith('/favicon') ||
         pathname.includes('maintenance') ||
         pathname.includes('/auth') ||
         pathname.includes('/test-page')
}

// Parse maintenance status from cookie - cookie is set by API routes
function parseMaintenanceCookie(request: NextRequest): { enabled: boolean; message: string; allowedIPs: string[] } {
  const maintenanceCookie = request.cookies.get('maintenance-status')
  
  if (maintenanceCookie?.value) {
    try {
      const decoded = JSON.parse(decodeURIComponent(maintenanceCookie.value))
      console.log('[Middleware] Found maintenance cookie:', decoded)
      return {
        enabled: decoded.enabled || false,
        message: decoded.message || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
        allowedIPs: decoded.allowedIPs || []
      }
    } catch (error) {
      console.error('[Middleware] Error parsing maintenance cookie:', error)
    }
  }
  
  console.log('[Middleware] No maintenance cookie found, defaulting to disabled')
  return {
    enabled: false,
    message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
    allowedIPs: []
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua static files và admin routes
  if (isAdminRoute(pathname)) {
    return NextResponse.next()
  }

  console.log(`[Middleware] Processing request: ${pathname}`)

  // Check maintenance mode từ cookie
  const maintenanceStatus = parseMaintenanceCookie(request)
  
  console.log(`[Middleware] Maintenance status:`, maintenanceStatus)

  // Check maintenance mode
  if (maintenanceStatus.enabled) {
    console.log(`[Middleware] Maintenance mode enabled, redirecting: ${pathname}`)
    const clientIP = getClientIP(request)
    
    // Kiểm tra IP whitelist
    if (maintenanceStatus.allowedIPs && maintenanceStatus.allowedIPs.length > 0) {
      if (!maintenanceStatus.allowedIPs.includes(clientIP)) {
        // Redirect đến maintenance page
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        url.searchParams.set('message', maintenanceStatus.message)
        return NextResponse.redirect(url)
      } else {
        console.log(`[Middleware] IP ${clientIP} is whitelisted, allowing access`)
      }
    } else {
      // Maintenance mode cho tất cả users nếu không có whitelist
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      url.searchParams.set('message', maintenanceStatus.message)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - maintenance (maintenance page itself)
     * - auth (authentication pages)
     * - test-page (testing page)
     * - logo (logo files)
     * - badges (badge images)
     * - static assets (.svg, .png, .jpg, .jpeg, .webp, .ico, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|maintenance|auth|test-page|logo|badges|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.ico|.*\\.css|.*\\.js).*)',
  ],
}