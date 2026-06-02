# @realtimejs/react

> The official React SDK for RealtimeJS.

![RealtimeJS](https://img.shields.io/badge/RealtimeJS-React-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

`@realtimejs/react` provides a suite of highly optimized, production-ready React Hooks and context providers for building realtime interfaces instantly.

It wraps the `@realtimejs/core` engine with an **Optimistic UI architecture**, ensuring that user interactions feel zero-latency while transparently handling network sync, offline queueing, and state management in the background.

## Features

- ⚡️ **Optimistic UI & Mutation Queue:** Messages instantly appear in the UI. Offline actions (edits, deletes) are safely queued and synced upon reconnection.
- 🔄 **Re-render Optimized (Zero-Latency):** Heavy use of `useCallback` and `useMemo` combined with Context-state-hoisting prevents React waterfall renders.
- 🧠 **Context-Driven Architecture:** Inject custom inputs, headers, or messages instantly using `useChatContext()` without prop-drilling.
- ⚙️ **Dynamic UI Configuration:** Expose a user settings dashboard effortlessly using `UIConfigProvider` and the `updateConfig` dispatcher.
- ♿️ **Accessible by Default:** All included components are ARIA-compliant (live regions, interactive roles).

## Installation

```bash
npm install @realtimejs/react @realtimejs/core
```
*(You will also need a transport adapter, e.g., `@realtimejs/adapter-socketio`)*

## Quick Start

### 1. Setup the Provider

Wrap your application (or specific route) in the `RealtimeProvider`.

```tsx
import { RealtimeProvider } from '@realtimejs/react';
import { createRealtime } from '@realtimejs/core';
import { createSocketIOAdapter } from '@realtimejs/adapter-socketio';

const client = createRealtime({ 
  transport: createSocketIOAdapter('http://localhost:3000') 
});

export function App() {
  return (
    <RealtimeProvider client={client}>
      <ChatInterface />
    </RealtimeProvider>
  );
}
```

### 2. Using the Hooks

```tsx
import { useChatContext } from '@realtimejs/react';

function CustomChatInterface() {
  // Access memoized state and methods directly from the Provider!
  const { messages, sendMessage } = useChatContext();

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content} - {msg.status}</div>
      ))}
      <button onClick={() => sendMessage("Hello!")}>Send</button>
    </div>
  );
}
```

### 3. Using the Drop-in UI Components

```tsx
import { Chat, ChatProvider } from '@realtimejs/react';

function QuickChat() {
  return (
    <ChatProvider roomId="room-1" userId="user-123">
      <Chat 
        roomId="room-1" 
        userId="user-123" 
        // Easily override internal UI elements:
        // components={{ MessageItem: CustomMessage }}
      />
    </ChatProvider>
  );
}
```

## Available Hooks
- `useRealtime()` - Access the raw core engine.
- `useChatContext()` - Access hoisted messaging, typing, and room states safely inside a `ChatProvider`.
- `usePresence()` - User online/offline mapping.
- `useUIConfig()` - Access and dispatch global Settings (like read receipts or pagination limits).
- `useChat(roomId, userId)` - Low-level messaging hook (used internally by `ChatProvider`).
- `useTyping(roomId, userId)` - Low-level typing indicator tracking (used internally by `ChatProvider`).

## License

MIT License. See the repository root for details.
