 ○ Compiling /api/ai/place-chat ...
 ✓ Compiled /api/ai/place-chat in 7.8s (4206 modules)
ID token verified for user: mFeG6i3HDKRVH6cCmwkyKXpOF3M2
User found with role: contributor
[PLACE-CHAT-API] Processing request: {
  userId: 'mFeG6i3HDKRVH6cCmwkyKXpOF3M2',
  placeId: 'U5m11mMWN7BQzL7BzbSu',
  messageLength: 23,
  historyLength: 0,
  remaining: 9
}
🚀 Initializing Genkit with Google AI...
✅ Genkit initialized successfully with Google AI.
[PLACE-CHAT] Processing request: { placeId: 'U5m11mMWN7BQzL7BzbSu', messageLength: 23 }
[PLACE-CHAT] Using database context only
[PLACE-CHAT] Success (database): {
  placeId: 'U5m11mMWN7BQzL7BzbSu',
  placeName: 'An Giang',
  inputTokens: 579,
  outputTokens: 19,
  cost: 0.00009825
}
[CHAT-LOG] Logged interaction: {
  userId: 'mFeG6i3HDKRVH6cCmwkyKXpOF3M2',
  placeId: 'U5m11mMWN7BQzL7BzbSu',
  tokensTotal: 598,
  cost: '0.000098',
  responseTime: 4828
}
[PLACE-CHAT-API] Success: {
  userId: 'mFeG6i3HDKRVH6cCmwkyKXpOF3M2',
  placeId: 'U5m11mMWN7BQzL7BzbSu',
  placeName: 'An Giang',
  responseTime: 4828,
  tokensUsed: { input: 579, output: 19 },
  remaining: 8
}
 POST /api/ai/place-chat 200