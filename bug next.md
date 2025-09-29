   ▲ Next.js 15.5.4
   - Local:        http://localhost:9005
   - Network:      http://172.25.32.1:9005
   - Environments: .env.local, .env
   - Experiments (use with caution):
     · optimizePackageImports

 ✓ Starting...
 ✓ Ready in 4.3s
 ✓ Compiled /middleware in 299ms (114 modules)
[Middleware] Processing request: /
[Middleware] No maintenance cookie found, defaulting to disabled
[Middleware] Maintenance status: {
  enabled: false,
  message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
  allowedIPs: []
}
 ○ Compiling / ...
 ✓ Compiled / in 21.4s (2385 modules)
 ⨯ Error: Cannot find module 'next/dist/shared/lib/no-fallback-error.external'
Require stack:
- C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\server\require.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\server\load-components.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\build\utils.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\build\swc\options.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\build\swc\index.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\build\next-config-ts\transpile-config.js       
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\server\config.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\server\next.js
- C:\Users\manhq\AppData\Local\npm-cache\_npx\8b377f6eec906bc4\node_modules\next\dist\server\lib\start-server.js
    at next/dist/shared/lib/no-fallback-error.external (C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js:1198:18)
    at __webpack_exec__ (C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js:1318:39)
    at <unknown> (C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js:1319:4992)
    at <unknown> (C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js:1319:47)
    at Object.<anonymous> (C:\Users\manhq\Downloads\da2\VietExplore-AI\.next\server\app\page.js:1322:3) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [Array],
  page: '/'
}
 ○ Compiling /_error ...