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

- 🧠 **Headless-First (Context-Driven):** The `<ChatProvider>` hoists all engine state. Use our `useChatContext()` hook to seamlessly inject your own UI components without deep prop-drilling!
- ⚡️ **Optimistic UI & Mutation Queue:** Instant visual feedback. Messages, edits, deletes, and reactions instantly appear while a robust background mutation queue ensures safe network syncing, even through reconnections.
- 🧩 **Framework Agnostic:** The core engine is pure TypeScript. Use our official React SDK today, or build your own wrapper for Vue/Svelte.
- 🔌 **Adapter Architecture:** Swap out Socket.IO for native WebSockets—or Postgres for MongoDB—by simply changing a single adapter. No app rewrites required.
- ⚙️ **Dynamic UI Configuration:** Easily toggle read receipts, presence, and pagination globally using `UIConfigProvider`.

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

// ChatApp.tsx
import React from 'react';
import { Chat, ChatProvider, useChatContext } from '@realtimejs/react';

export function ChatApp() {
  const ROOM_ID = 'general';
  const USER_ID = 'user-123'; // In production, get this from your Auth context

  return (
    <div className="h-screen max-w-md mx-auto py-10">
      <ChatProvider roomId={ROOM_ID} userId={USER_ID}>
        <Chat roomId={ROOM_ID} userId={USER_ID} />
      </ChatProvider>
    </div>
  );
}

// Want a custom input? Just use the context!
function CustomInput() {
  const { sendMessage } = useChatContext();
  return <button onClick={() => sendMessage('Hello World!')}>Send</button>;
}
```

---

## 🏗 Architecture & Ecosystem

RealtimeJS relies on an **Adapter Architecture**. The Core never imports Socket.IO directly. Instead, you inject adapters via `createRealtime()`.

### Current Official Packages

| Package | Version | Description |
|---|---|---|
| `@realtimejs/core` | [![npm version](https://img.shields.io/npm/v/@realtimejs/core.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/core) | Framework-agnostic realtime engine and state machine. |
| `@realtimejs/react` | [![npm version](https://img.shields.io/npm/v/@realtimejs/react.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/react) | Official React hooks (`useChatContext`, `usePresence`) and UI primitives. |
| `@realtimejs/adapter-socketio` | [![npm version](https://img.shields.io/npm/v/@realtimejs/adapter-socketio.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/adapter-socketio) | Standard Socket.IO transport adapter. |
| `@realtimejs/adapter-websocket` | [![npm version](https://img.shields.io/npm/v/@realtimejs/adapter-websocket.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/adapter-websocket) | Zero-dependency native WebSocket adapter. |
| `@realtimejs/adapter-postgres` | [![npm version](https://img.shields.io/npm/v/@realtimejs/adapter-postgres.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/adapter-postgres) | Dynamic JSONB PostgreSQL database adapter. |
| `@realtimejs/adapter-s3` | [![npm version](https://img.shields.io/npm/v/@realtimejs/adapter-s3.svg?style=flat-square)](https://npmjs.com/package/@realtimejs/adapter-s3) | AWS S3 storage adapter. |

*(More adapters for MongoDB, LiveKit WebRTC, and Authentication are on the roadmap).*

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
- Want to persist messages differently? Build `@realtimejs/adapter-mongodb`.
- Want to use a different cloud? Build `@realtimejs/adapter-gcs`.

Please read our [Engineering Standards](docs/12-engineering-standards.md) before submitting a PR.

---

## 📄 License

This project is licensed under the MIT License.
