/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://viet-explore-ai.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  
  // Chỉ loại trừ những trang thực sự private
  exclude: [
    '/admin/*',           // Admin dashboard
    '/api/*',             // API routes
    '/auth/login',        // Login page
    '/auth/register',     // Register page  
    '/auth/forgot-password', // Password reset
    '/moderation/*',      // Moderation pages
    '/404',               // Error pages
    '/500',
    '/_next/*',           // Next.js internals
    '/private/*'
  ],
  
  // Cấu hình đa ngôn ngữ
  alternateRefs: [
    {
      href: 'https://viet-explore-ai.vercel.app',
      hreflang: 'vi',
    },
    {
      href: 'https://viet-explore-ai.vercel.app/en',
      hreflang: 'en',
    },
  ],

  // Custom transformation với SEO tối ưu
  transform: async (config, path) => {
    // Thiết lập priority và changefreq dựa trên route
    let priority = config.priority;
    let changefreq = config.changefreq;

    // Trang chủ - Priority cao nhất
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Trang AI Assistant - Core feature
    else if (path.startsWith('/ai-assistant')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Trang Places - Nội dung chính
    else if (path.startsWith('/places')) {
      if (path === '/places') {
        priority = 0.9; // Places listing
        changefreq = 'daily';
      } else if (path.includes('/places/regions/') || path.includes('/places/types/')) {
        priority = 0.8; // Category pages
        changefreq = 'weekly';
      } else {
        priority = 0.8; // Individual places
        changefreq = 'weekly';
      }
    }
    // Trang Community - Nội dung động
    else if (path.startsWith('/community')) {
      priority = 0.8;
      changefreq = 'daily';
    }
    // Itineraries - Nội dung quan trọng
    else if (path.startsWith('/itineraries')) {
      if (path === '/itineraries/builder') {
        priority = 0.8;
        changefreq = 'monthly';
      } else {
        priority = 0.7;
        changefreq = 'weekly';
      }
    }
    // Contribute pages
    else if (path.startsWith('/contribute')) {
      priority = 0.7;
      changefreq = 'monthly';
    }
    // Profile pages
    else if (path.startsWith('/profile')) {
      if (path === '/profile/me') {
        return null; // Private page
      }
      priority = 0.6;
      changefreq = 'weekly';
    }
    // About pages
    else if (path.startsWith('/about')) {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Help pages
    else if (path.startsWith('/help')) {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Resources
    else if (path.startsWith('/resources')) {
      priority = 0.6;
      changefreq = 'weekly';
    }
    // Settings - Semi-private
    else if (path.startsWith('/settings')) {
      return null; // User settings không cần trong sitemap
    }
    // Legal pages
    else if (path.startsWith('/legal')) {
      priority = 0.3;
      changefreq = 'yearly';
    }

    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },

  // Thêm nhiều paths để có sitemap chi tiết nhất
  additionalPaths: async (config) => {
    const result = [];
    
    try {
      // === STATIC PAGES QUAN TRỌNG ===
      const staticPages = [
        // AI Assistant - Core features
        {
          loc: '/ai-assistant',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.9
        },
        {
          loc: '/ai-assistant/chat',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        },
        {
          loc: '/ai-assistant/plan',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.9
        },

        // Places categories
        {
          loc: '/places/map',
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8
        },
        {
          loc: '/places/saved',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6
        },

        // Community pages
        {
          loc: '/community/guidelines',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        },
        {
          loc: '/community/handbook',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        },
        {
          loc: '/community/announcements',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        },

        // Contribute pages  
        {
          loc: '/contribute',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        },
        {
          loc: '/contribute/new-place',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        },
        {
          loc: '/contribute/guide',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        },
        {
          loc: '/contribute/my-drafts',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.5
        },

        // Help & Resources
        {
          loc: '/help',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        },
        {
          loc: '/help/faq',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        },
        {
          loc: '/resources',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6
        },

        // About pages
        {
          loc: '/about/mission',
          lastmod: new Date().toISOString(),
          changefreq: 'yearly',
          priority: 0.5
        },
        {
          loc: '/about/partnership',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.5
        },

        // Itineraries
        {
          loc: '/itineraries/my',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6
        }
      ];

      result.push(...staticPages);

      // === DYNAMIC ROUTES - HARDCODED SAMPLE DATA ===
      
      // Sample Places - Các địa điểm nổi tiếng Việt Nam
      const samplePlaces = [
        'vinh-ha-long', 'bai-bien-my-khe', 'pho-co-hoi-an', 'chu-a-mot-cot',
        'bai-bien-quy-nhon', 'doi-che-moc-chau', 'thac-ban-gioc', 'dao-phu-quoc',
        'thanh-pho-da-lat', 'vuon-quoc-gia-phong-nha', 'thanh-co-hue', 'lang-bac',
        'bai-bien-nha-trang', 'cao-nguyen-dong-van', 'rung-tram-tra-su', 'chua-bai-dinh',
        'ben-thanh-market', 'cu-chi-tunnels', 'mekong-delta', 'hoi-an-ancient-town'
      ];
      
      samplePlaces.forEach(placeSlug => {
        result.push({
          loc: `/places/${placeSlug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      // Sample Itineraries
      const sampleItineraries = [
        'ha-noi-3-ngay', 'sapa-trekking-5-ngay', 'ho-chi-minh-2-ngay',
        'da-nang-hoi-an-4-ngay', 'phu-quoc-nghi-duong', 'da-lat-romantic',
        'ha-long-cruise-2-days', 'mekong-delta-tour', 'hue-culture-trip'
      ];
      
      sampleItineraries.forEach(itinerarySlug => {
        result.push({
          loc: `/itineraries/${itinerarySlug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        });
      });

      // === CATEGORY PAGES ===
      
      // Regions (Vùng miền Việt Nam)
      const regions = ['bac-bo', 'trung-bo', 'nam-bo', 'tay-nguyen', 'dong-bang-song-cuu-long'];
      regions.forEach(region => {
        result.push({
          loc: `/places/regions/${region}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      // Place types (Loại hình du lịch)
      const placeTypes = [
        'bien', 'nui', 'chua-den', 'di-tich', 'thac-nuoc', 'vuon-quoc-gia', 
        'dao', 'thanh-pho', 'lang-co', 'bao-tang', 'khu-nghi-duong', 'cho-dem'
      ];
      placeTypes.forEach(type => {
        result.push({
          loc: `/places/types/${type}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      // === SAMPLE USER PROFILES (public) ===
      const sampleUsernames = [
        'dulich-viet', 'vietnam-explorer', 'travel-expert', 'local-guide',
        'culture-enthusiast', 'adventure-seeker', 'food-lover', 'photographer'
      ];
      sampleUsernames.forEach(username => {
        result.push({
          loc: `/profile/${username}`,
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.5
        });
      });

      // === TỈNH THÀNH PHỐ ===
      const provinces = [
        'ha-noi', 'ho-chi-minh', 'da-nang', 'hai-phong', 'can-tho',
        'quang-ninh', 'lam-dong', 'khanh-hoa', 'phu-quoc', 'sa-pa',
        'hoi-an', 'hue', 'nha-trang', 'da-lat', 'vung-tau'
      ];
      provinces.forEach(province => {
        result.push({
          loc: `/places/provinces/${province}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        });
      });

      console.log(`Generated ${result.length} additional sitemap URLs`);

    } catch (error) {
      console.log('Error generating additional sitemap paths:', error);
    }

    return result;
  },

  // Robots.txt tối ưu cho SEO
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: [
          '/admin/*',
          '/api/*', 
          '/auth/*',
          '/moderation/*',
          '/settings/*',
          '/profile/me',
          '/*.json$',
          '/private/*',
          '/_next/*'
        ],
      },
      // Cấu hình đặc biệt cho search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      }
    ],
    additionalSitemaps: [
      // Có thể thêm sitemap cho images, videos sau này
      // 'https://viet-explore-ai.vercel.app/sitemap-images.xml'
    ],
  },
}
