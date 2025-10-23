main-app.js?v=1761221862275:2282 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\ui\toast-service.ts:238 [ToastService] Initialized and ready
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\pwa-debug.ts:129 [PWA Debug] Utilities loaded. Available commands:
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\pwa-debug.ts:130   window.resetPWAPrompt() - Reset install prompt state
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\pwa-debug.ts:131   window.checkPWAPrompt() - Check current state
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\pwa-debug.ts:132   window.incrementPWAVisit() - Force increment visit count
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\pwa-debug.ts:133   window.checkPWASupport() - Check browser support
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\ui\toast-provider-bridge.tsx:34 [ToastProviderBridge] Subscribed to toast service
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\pwa\service-worker-registration.tsx:79 [PWA] Service Worker disabled in development mode
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\pwa\install-prompt.tsx:33 [PWA Install Prompt] Initializing...
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\pwa\install-prompt.tsx:51 [PWA Install Prompt] Visit count: 41
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\pwa\install-prompt.tsx:78 [PWA Install Prompt] Event listener added
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\analytics\microsoft-clarity.tsx:33 [Microsoft Clarity] Initializing with project ID: t6zei0ph7p
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\auth\auth-provider.tsx:302 [Redirect] No pending redirect result
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\client\api.ts:52 API Response for /reviews/vQ1kgJjInwbVDs60kNSk/helpful: {status: 200, text: '{"isHelpful":false}'}
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\client\api.ts:52 API Response for /reviews/vQ1kgJjInwbVDs60kNSk/helpful: {status: 200, text: '{"isHelpful":false}'}
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:41 [REVIEW-FORM] Submit triggered
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:42 [REVIEW-FORM] Form state: {rating: 5, hasTitle: false, hasContent: true, hasVisitDate: false, isAnonymous: false}
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:65 [REVIEW-FORM] ✅ Validation passed
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:66 [REVIEW-FORM] Submitting review data: {
  "placeId": "DHYDdtZBkRWeDk3KJgZI",
  "rating": 5,
  "content": "đẹp nha",
  "isAnonymous": false
}
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\api.ts:16  POST http://localhost:9002/api/places/DHYDdtZBkRWeDk3KJgZI/reviews 500 (Internal Server Error)
authenticatedFetch @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\lib\utils\api.ts:16
await in authenticatedFetch
submitReview @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\hooks\use-place-reviews.ts:122
handleReviewSubmit @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\place-detail-content.tsx:638
handleSubmit @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:70
executeDispatch @ react-dom-client.development.js:16502
runWithFiberInDEV @ react-dom-client.development.js:845
processDispatchQueue @ react-dom-client.development.js:16552
eval @ react-dom-client.development.js:17150
batchedUpdates$1 @ react-dom-client.development.js:3263
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16706
dispatchEvent @ react-dom-client.development.js:20816
dispatchDiscreteEvent @ react-dom-client.development.js:20784
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\hooks\use-place-reviews.ts:176 Error submitting review: Error: Không thể gửi đánh giá: Internal Server Error
    at submitReview (C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\hooks\use-place-reviews.ts:139:17)
    at async handleReviewSubmit (C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\place-detail-content.tsx:638:7)
    at async handleSubmit (C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:70:7)
error @ intercept-console-error.js:50
submitReview @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\hooks\use-place-reviews.ts:176
await in submitReview
handleReviewSubmit @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\place-detail-content.tsx:638
handleSubmit @ C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:70
executeDispatch @ react-dom-client.development.js:16502
runWithFiberInDEV @ react-dom-client.development.js:845
processDispatchQueue @ react-dom-client.development.js:16552
eval @ react-dom-client.development.js:17150
batchedUpdates$1 @ react-dom-client.development.js:3263
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16706
dispatchEvent @ react-dom-client.development.js:20816
dispatchDiscreteEvent @ react-dom-client.development.js:20784
C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI\src\components\modals\review-modal.tsx:72 [REVIEW-FORM] ✅ Review submitted successfully
