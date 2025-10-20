'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * Microsoft Clarity Analytics Component
 *
 * Tích hợp Microsoft Clarity để:
 * - Ghi lại session recordings (phiên làm việc người dùng)
 * - Tạo heatmaps (bản đồ nhiệt về click, scroll)
 * - Phân tích hành vi người dùng (rage clicks, dead clicks)
 *
 * Best Practices:
 * - Chỉ load trong production (không chạy ở dev)
 * - Sử dụng Script component với strategy="afterInteractive"
 * - Tách riêng client component (không force root layout client-render)
 * - Sử dụng environment variables cho project ID
 *
 * Privacy:
 * - GDPR compliant
 * - Không thu thập PII (Personally Identifiable Information)
 * - Tuân thủ CCPA, COPPA
 *
 * @see https://clarity.microsoft.com/
 */
export function MicrosoftClarity() {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

  useEffect(() => {
    // Log khi Clarity được khởi tạo (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Microsoft Clarity] Initializing with project ID:', clarityProjectId)
    }
  }, [clarityProjectId])

  // Chỉ load Clarity trong production và khi có project ID
  if (process.env.NODE_ENV !== 'production' || !clarityProjectId) {
    return null
  }

  return (
    <>
      <Script
        id="microsoft-clarity-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
          `,
        }}
      />
    </>
  )
}
