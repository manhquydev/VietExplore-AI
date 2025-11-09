PS C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI> npm run dev

> Du-Lich-Viet@3.0.0 dev
> node scripts/start-dev.js

🚀 Đang tìm port khả dụng bắt đầu từ 9002...
✅ Khởi động Next.js trên port 9002
   ▲ Next.js 15.3.3
   - Local:        http://localhost:9002
   - Network:      http://192.168.2.234:9002
   - Environments: .env.local, .env

 ✓ Starting...
 ○ (serwist) Serwist is disabled.
 ○ (serwist) Serwist is disabled.
 ✓ Ready in 4.9s
 ○ Compiling /middleware ...
 ✓ Compiled /middleware in 598ms (153 modules)
[Middleware] Processing request: /ai-assistant/chat
[Middleware] No maintenance cookie found, defaulting to disabled
[Middleware] Maintenance status: {
  enabled: false,
  message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
  allowedIPs: []
}
 ○ Compiling /ai-assistant/chat ...
 ✓ Compiled /ai-assistant/chat in 18.1s (2975 modules)
 GET /ai-assistant/chat 200 in 20827ms
[Middleware] Processing request: /ai-assistant/chat
[Middleware] No maintenance cookie found, defaulting to disabled
[Middleware] Maintenance status: {
  enabled: false,
  message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
  allowedIPs: []
}
 GET /ai-assistant/chat 200 in 344ms
 ✓ Compiled in 3s (1311 modules)
 ○ Compiling /api/ai/rate-limit ...
 ✓ Compiled /api/ai/chat in 9s (4026 modules)
[Firebase Admin] Initializing with storage bucket: vietexplore-ai.firebasestorage.app
[Firebase Admin] Initializing with database URL: https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
ID token verified for user: tuogbsxr2qRkaaqeGmJ7wIbTHV13
ID token verified for user: tuogbsxr2qRkaaqeGmJ7wIbTHV13
User found with role: contributor
User found with role: contributor
[RATE-LIMIT-API] Quota fetched: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  role: 'contributor',
  used: 4,
  remaining: 16,
  limit: 20
}
 GET /api/ai/rate-limit 200 in 12346ms
ID token verified for user: tuogbsxr2qRkaaqeGmJ7wIbTHV13
[AI-RATE-LIMIT] Transaction check: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  today: '2025-11-09',
  currentCount: 4,
  limit: 20,
  allowed: true
}
User found with role: contributor
[AI-RATE-LIMIT] ✅ Quota incremented: { userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13', used: 5, remaining: 15 }
[GENERAL-CHAT-API] 🔄 Processing request: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  role: 'contributor',
  messageLength: 69,
  historyLength: 0,
  quotaRemaining: 15
}
🚀 Initializing Genkit with Google AI...
✅ Genkit initialized successfully with Google AI.
[CHAT-FLOW] Processing: { messageLength: 69, historyLength: 0 }
[CHAT-FLOW] Intent: plan
[CHAT-FLOW] Context summary: {
  budget: undefined,
  duration: undefined,
  interests: [],
  destinations: [],
  lastIntent: 'unclear'
}
[CHAT-FLOW] Calling Gemini 2.5 Flash...
[RATE-LIMIT-API] Quota fetched: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  role: 'contributor',
  used: 5,
  remaining: 15,
  limit: 20
}
 GET /api/ai/rate-limit 200 in 2129ms
[CHAT-FLOW] Raw Gemini result: {
  hasText: true,
  textType: 'string',
  textValue: '',
  hasUsage: true,
  finishReason: 'length',
  finishMessage: undefined,
  messageContent: undefined,
  resultKeys: [
    'message',
    'finishReason',
    'finishMessage',
    'usage',
    'custom',
    'raw',
    'request',
    'operation',
    'model',
    'parser'
  ]
}
[CHAT-FLOW] Text extraction: {
  fromDirect: 'empty/undefined',
  fromMessage: 'empty/undefined',
  finalText: 'NONE',
  preview: '(NO TEXT EXTRACTED)'
}
[CHAT-FLOW] Success: {
  intent: 'plan',
  responseLength: 61,
  isFallback: true,
  hasFollowUp: false
}
[AI-CHAT-LOG] ✅ Logged interaction: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  placeId: 'GENERAL',
  source: 'general_chat',
  tokensTotal: 0,
  cost: '0.000000',
  responseTime: '4262ms'
}
[GENERAL-CHAT-API] ✅ Request completed: {
  userId: 'tuogbsxr2qRkaaqeGmJ7wIbTHV13',
  responseTime: '4262ms',
  tokensUsed: undefined,
  quotaRemaining: 15
}
 POST /api/ai/chat 200 in 14689ms