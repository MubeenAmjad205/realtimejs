# @realtimejs/react

> The official React SDK for RealtimeJS.

![RealtimeJS](https://img.shields.io/badge/RealtimeJS-React-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

`@realtimejs/react` provides a suite of highly optimized, production-ready React Hooks and context providers for building realtime interfaces instantly.

It wraps the `@realtimejs/core` engine with an **Optimistic UI architecture**, ensuring that user interactions feel zero-latency while transparently handling network sync, offline queueing, and state management in the background.

## Features

- ⚡️ **Optimistic UI:** Messages instantly appear in the UI before network confirmation.
- 🔄 **Re-render Optimized:** Heavy use of `useCallback` and `useMemo` prevents React waterfall renders.
- 🧩 **Headless & Pre-built UI:** Use raw hooks to build your own UI, or use the extensible `<Chat />` wrapper component.
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
import { useChat, usePresence } from '@realtimejs/react';

function ChatInterface() {
  // Access memoized state and methods
  const { messages, sendMessage } = useChat('room-1', 'user-123');
  const { presenceMap } = usePresence();

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
- `useChat(roomId, userId)` - Unified messaging hook.
- `useMessages()` - Granular scoped messaging hook.
- `useSendMessage()` - Granular scoped sender hook.
- `usePresence()` - User online/offline mapping.
- `useTyping(roomId, userId)` - Typing indicator tracking.
- `useRoom(roomId)` - Manage room multiplexing connections.

## License

MIT License. See the repository root for details.
