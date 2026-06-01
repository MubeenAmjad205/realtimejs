<div align="center">
  <h1>⚡ RealtimeJS</h1>
  <p><strong>The headless, framework-agnostic realtime toolkit for modern applications.</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/@realtimejs/core"><img src="https://img.shields.io/npm/v/@realtimejs/core.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://github.com/MubeenAmjad205/realtimejs/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square" alt="TypeScript" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/framework-React-61dafb.svg?style=flat-square&logo=react&logoColor=black" alt="React SDK" /></a>
  </p>
</div>

---

Build production-ready chat, presence, and realtime collaboration features in **under 10 minutes** without fighting complex infrastructure. 

RealtimeJS gives you **full control over your UI** (Headless-First) and **full control over your transport layer** (Adapter System), while completely abstracting away the complexity of state synchronization, reconnection logic, and room management.

## ✨ Features

- 🧠 **Headless-First:** We provide the logic (`useChat`, `usePresence`); you bring your own UI (or use our copy-pasteable Tailwind components).
- 🧩 **Framework Agnostic:** The core engine is pure TypeScript. Use our official React SDK today, or build your own wrapper for Vue/Svelte.
- 🔌 **Adapter Architecture:** Swap out Socket.IO for native WebSockets—or Postgres for MongoDB—by simply changing a single adapter. No app rewrites required.
- 🚀 **Production Ready:** Built-in connection lifecycle management, optimistic updates, and room state handling out of the box.

## 📖 Table of Contents
- [Installation](#-installation)
- [Quick Start (in 10 minutes)](#-quick-start-in-10-minutes)
- [Architecture & Ecosystem](#-architecture--ecosystem)
- [Publishing & Setup](#-publishing--setup)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📦 Installation

Install the core framework, the React SDK, and your transport adapter of choice:

```bash
npm install @realtimejs/core @realtimejs/react @realtimejs/adapter-socketio socket.io-client
```

---

## 🚀 Quick Start (in 10 minutes)

### 1. Initialize the Realtime Engine
Create an instance of the Realtime Core and provide it to your app using the `RealtimeProvider`. It automatically handles connections and cleanup.

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
Use our headless hooks to instantly wire up chat logic without writing boilerplate. We export un-opinionated UI components you can use right away.

```tsx
// ChatApp.tsx
import React from 'react';
import { useChat, useTyping } from '@realtimejs/react';
import { ChatRoom, MessageList, MessageInput, TypingIndicator } from '@realtimejs/react';

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

## 🏗 Architecture & Ecosystem

RealtimeJS relies on an **Adapter Architecture**. The Core never imports Socket.IO directly. Instead, you inject adapters via `createRealtime()`.

### Current Official Packages

| Package | Version | Description |
|---|---|---|
| `@realtimejs/core` | [![npm version](https://img.shields.io/npm/v/@realtimejs/core.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/core) | Framework-agnostic realtime engine and state machine. |
| `@realtimejs/react` | [![npm version](https://img.shields.io/npm/v/@realtimejs/react.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/react) | Official React hooks (`useChat`, `usePresence`) and UI primitives. |
| `@realtimejs/adapter-socketio` | [![npm version](https://img.shields.io/npm/v/@realtimejs/adapter-socketio.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/adapter-socketio) | Standard Socket.IO transport adapter. |

*(More adapters for Databases, LiveKit WebRTC, and Authentication are on the roadmap).*

---

## 🛠 Publishing & Setup

This repository uses `npm workspaces`. To publish your own fork or modifications:

1. **Login to NPM**: `npm login`
2. **Build the packages**: `npm run build`
3. **Publish**: `npm publish --workspaces --access public`

> ⚠️ **Note on NPM Scopes**: To publish these packages, you must own the `@realtimejs` organization on NPM. If you do not, you will need to change the `"name"` field in each `package.json` to your own scope (e.g., `@yourusername/core`).

---

## 🤝 Contributing

We love open source! Because RealtimeJS uses an Adapter architecture, the best way to contribute is to **build new adapters**. 
- Want to use WebSockets instead of Socket.IO? Build `@realtimejs/adapter-websocket`.
- Want to persist messages? Build `@realtimejs/adapter-postgres`.

Please read our [Engineering Standards](docs/12-engineering-standards.md) before submitting a PR.

---

## 📄 License

This project is licensed under the MIT License.
