  GET http://localhost:9002/ai-assistant/chat 500 (Internal Server Error)
performFullReload @ webpack-internal:///…oader-client.js:379
handleApplyUpdates @ webpack-internal:///…oader-client.js:341
eval @ webpack-internal:///…oader-client.js:368
Promise.then
tryApplyUpdatesWebpack @ webpack-internal:///…oader-client.js:365
handleSuccess @ webpack-internal:///…oader-client.js:114
processMessage @ webpack-internal:///…oader-client.js:240
eval @ webpack-internal:///…loader-client.js:71
handleMessage @ webpack-internal:///…ges/websocket.js:65
main.js:2435 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
index.js:640 Uncaught ModuleBuildError: Module build failed (from ./node_modules/next/dist/build/webpack/loaders/next-swc-loader.js):
Error:   × Unexpected token `div`. Expected jsx identifier
     ╭─[C:\Users\manhq\Downloads\da2\VietExplore-AI\src\app\ai-assistant\chat\page.tsx:264:1]
 261 │ 
 262 │   if (!isAuthenticated) {
 263 │     return (
 264 │       <div className="min-h-screen bg-bg">
     ·        ───
 265 │         <Header />
 266 │         <main className="min-h-screen pt-16">
 267 │           <div className="container max-w-2xl mx-auto">
     ╰────


Caused by:
    Syntax Error
    at processResult (file://C:\Users\manhq\Downloads\da2\VietExplore-AI\node_modules\next\dist\compiled\webpack\bundle5.js:29:407111)
    at <unknown> (file://C:\Users\manhq\Downloads\da2\VietExplore-AI\node_modules\next\dist\compiled\webpack\bundle5.js:29:408906)
    at <unknown> (file://C:\Users\manhq\Downloads\da2\VietExplore-AI\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:8645)
    at <unknown> (file://C:\Users\manhq\Downloads\da2\VietExplore-AI\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5019)
    at r.callback (file://C:\Users\manhq\Downloads\da2\VietExplore-AI\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4039)
getServerError @ node-stack-frames.js:49
eval @ index.js:640
setTimeout
hydrate @ index.js:618
await in hydrate
pageBootstrap @ page-bootstrap.js:29
eval @ next-dev.js:24
Promise.then
eval @ next-dev.js:22
(pages-dir-browser)/./node_modules/next/dist/client/next-dev.js @ main.js:1491
options.factory @ webpack.js:693
__webpack_require__ @ webpack.js:37
__webpack_exec__ @ main.js:2549
(anonymous) @ main.js:2550
webpackJsonpCallback @ webpack.js:1369
(anonymous) @ main.js:9
websocket.js:42 [HMR] connected
client.js:82 ./src/app/ai-assistant/chat/page.tsx
Error:   × Unexpected token `div`. Expected jsx identifier
     ╭─[C:\Users\manhq\Downloads\da2\VietExplore-AI\src\app\ai-assistant\chat\page.tsx:264:1]
 261 │ 
 262 │   if (!isAuthenticated) {
 263 │     return (
 264 │       <div className="min-h-screen bg-bg">
     ·        ───
 265 │         <Header />
 266 │         <main className="min-h-screen pt-16">
 267 │           <div className="container max-w-2xl mx-auto">
     ╰────

Caused by:
    Syntax Error
nextJsHandleConsoleError @ client.js:82
handleErrors @ hot-reloader-client.js:163
processMessage @ hot-reloader-client.js:224
eval @ hot-reloader-client.js:71
handleMessage @ websocket.js:65
