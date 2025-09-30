○ Compiling /api/users/avatar ...
 ✓ Compiled /api/users/avatar in 2.6s (2577 modules)
[Avatar Upload] Starting upload process...
ID token verified for user: fovZWjis7SYwRmHdfXqxvsJIsMy1
User found with role: traveler
[Avatar Upload] User authenticated: fovZWjis7SYwRmHdfXqxvsJIsMy1
[Avatar Upload] Converting file to buffer...
[Avatar Upload] Buffer size: 477422
[Avatar Upload] Starting Sharp processing...
[Avatar Upload] Sharp processing completed. Size: 40060
[Avatar Upload] Getting Firebase Storage bucket...
[Avatar Upload] Bucket name: vietexplore-ai.appspot.com
[Avatar Upload] ERROR: {
  message: '{\n' +
    '  "error": {\n' +
    '    "code": 404,\n' +
    '    "message": "The specified bucket does not exist.",\n' +
    '    "errors": [\n' +
    '      {\n' +
    '        "message": "The specified bucket does not exist.",\n' +
    '        "domain": "global",\n' +
    '        "reason": "notFound"\n' +
    '      }\n' +
    '    ]\n' +
    '  }\n' +
    '}\n',
  stack: 'Error: {\n' +
    '  "error": {\n' +
    '    "code": 404,\n' +
    '    "message": "The specified bucket does not exist.",\n' +
    '    "errors": [\n' +
    '      {\n' +
    '        "message": "The specified bucket does not exist.",\n' +
    '        "domain": "global",\n' +
    '        "reason": "notFound"\n' +
    '      }\n' +
    '    ]\n' +
    '  }\n' +
    '}\n' +
    '\n' +
    '    at Gaxios._request (C:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI\\node_modules\\gaxios\\build\\src\\gaxios.js:142:23)\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
    '    at async JWT.requestAsync (C:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI\\node_modules\\google-auth-library\\build\\src\\auth\\oauth2client.js:429:18)\n' +
    '    at async Upload.makeRequest (C:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI\\node_modules\\@google-cloud\\storage\\build\\cjs\\src\\resumable-upload.js:769:21)\n' +
    '    at async uri.retries (C:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI\\node_modules\\@google-cloud\\storage\\build\\cjs\\src\\resumable-upload.js:435:29)\n' +
    '    at async Upload.createURIAsync (C:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI\\node_modules\\@google-cloud\\storage\\build\\cjs\\src\\resumable-upload.js:432:21)',
  name: 'Error'
}
 POST /api/users/avatar 500 in 5378ms
