hot-reloader-client.js:102 Console was cleared
client.js:82 ./src/components/place-chat-widget.tsx:21:1
Module not found: Can't resolve '@/components/ui/use-toast'
  19 | import { cn } from '@/lib/utils';
  20 | import ReactMarkdown from 'react-markdown';
> 21 | import { toast } from '@/components/ui/use-toast';
     | ^
  22 |
  23 | interface PlaceChatWidgetProps {
  24 |   placeId: string;

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/components/place-detail-content.tsx
nextJsHandleConsoleError @ client.js:82
handleErrors @ hot-reloader-client.js:163
processMessage @ hot-reloader-client.js:224
eval @ hot-reloader-client.js:71
handleMessage @ websocket.js:65
favicon.ico:1  GET http://localhost:9002/favicon.ico 404 (Not Found)
