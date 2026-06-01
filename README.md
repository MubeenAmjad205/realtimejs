# RealtimeJS ⚡

The headless, framework-agnostic realtime toolkit for modern applications.

Build production-ready chat, presence, and realtime collaboration features in under 10 minutes without fighting complex infrastructure. 

RealtimeJS gives you full control over your UI (Headless-First) and full control over your transport layer (Adapter System), while completely removing the complexity of state synchronization, reconnection logic, and room management.

---

## The Philosophy

- **Headless-First:** We provide the logic (`useChat`, `usePresence`); you bring your own UI (or use our copy-pasteable Tailwind components).
- **Framework Agnostic:** Core logic is pure TypeScript. Use our React SDK today, or write your own wrapper for Vue or Svelte.
- **Bring Your Own Backend:** Swap out Socket.IO for WebSockets by simply changing an adapter. No app rewrites required.

---

## Installation

Install the core framework, the React SDK, and your transport adapter of choice:

```bash
npm install @realtimejs/core @realtimejs/react @realtimejs/adapter-socketio socket.io-client
```

---

## Quick Start (Under 10 Minutes)

### 1. Initialize the Realtime Engine
Create an instance of the Realtime Core and provide it to your app using the `RealtimeProvider`.

```tsx
// App.tsx
import React from 'react';
import { createRealtime } from '@realtimejs/core';
import { socketioAdapter } from '@realtimejs/adapter-socketio';
import { RealtimeProvider } from '@realtimejs/react';

const realtimeClient = createRealtime({
  transport: socketioAdapter({ url: 'http://localhost:3000' })
});

export function App() {
  return (
    <RealtimeProvider client={realtimeClient}>
      <ChatApp />
    </RealtimeProvider>
  );
}
```

### 2. Build Your Chat UI
Use our headless hooks to instantly wire up chat logic without writing boilerplate.

```tsx
// ChatApp.tsx
import React from 'react';
import { useChat, useTyping } from '@realtimejs/react';
import { ChatRoom, MessageList, MessageInput, TypingIndicator } from '@realtimejs/react'; // UI exports available directly!

export function ChatApp() {
  const ROOM_ID = 'general';
  const USER_ID = 'user-123'; // In production, get this from your Auth context

  const { messages, sendMessage } = useChat(ROOM_ID, USER_ID);
  const { typingUsers, startTyping, stopTyping } = useTyping(ROOM_ID, USER_ID);

  return (
    <div className="h-screen max-w-md mx-auto py-10">
      <ChatRoom>
        <MessageList messages={messages} currentUserId={USER_ID} />
        <TypingIndicator users={typingUsers} />
        <MessageInput 
          onSend={sendMessage} 
          onTyping={(isTyping) => isTyping ? startTyping() : stopTyping()} 
        />
      </ChatRoom>
    </div>
  );
}
```

---

## Architecture & Adapters

RealtimeJS relies on an **Adapter Architecture**. The Core never imports Socket.IO directly. Instead, you inject adapters via `createRealtime()`.

### Supported Adapters:
- **Transport:** `@realtimejs/adapter-socketio`

---

## Publishing to NPM

This monorepo uses `npm workspaces`. To publish all packages:

1. Ensure you are logged in to npm: `npm login`
2. Run the build: `npm run build`
3. Publish workspaces: `npm publish --workspaces --access public`

> **Note on Scopes:** To publish these packages exactly as named, you must own the `@realtimejs` organization on npm. Otherwise, change the `name` field in each `package.json` to your own scope (e.g., `@yourusername/core`).

---

## License

MIT
