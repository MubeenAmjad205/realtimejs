# @realtimejs/core

> The framework-agnostic realtime engine and state machine.

![RealtimeJS](https://img.shields.io/badge/RealtimeJS-Core-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

`@realtimejs/core` is the foundational engine of the RealtimeJS ecosystem. It provides a robust, adapter-driven architecture for managing realtime connections, event routing, messaging, presence, and session state.

It is designed to be **transport-agnostic**—meaning it works seamlessly with WebSockets, Socket.IO, LiveKit, or any custom transport layer you want to plug into it.

## Features

- 🔌 **Adapter Driven:** Swap between Socket.IO, Native WebSockets, or custom adapters without changing any core business logic.
- 💬 **Advanced Chat Mechanics:** Built-in offline queueing, message status tracking (sending, sent, read, failed), reactions, and editing.
- 🟢 **Presence & Typing:** Real-time user status tracking and typing indicators.
- 🛡 **100% Type Safe:** Written in strict TypeScript with no `any` types.
- 🔒 **Security First:** Inject permission callbacks to validate `canSend`, `canEdit`, and `canDelete` operations.

## Installation

```bash
npm install @realtimejs/core
```

## Quick Start

You must combine `@realtimejs/core` with a transport adapter.

```typescript
import { createRealtime } from '@realtimejs/core';
import { createSocketIOAdapter } from '@realtimejs/adapter-socketio';

// 1. Initialize the adapter
const transport = createSocketIOAdapter('http://localhost:3000');

// 2. Initialize the core engine
const client = createRealtime({ transport });

// 3. Connect to the server
await client.connection.connect();

// 4. Send a message with built-in offline queueing support
const message = await client.chat.sendMessage('room-1', 'Hello World!', 'user-123');
```

## Architecture

The core exports several managers for interacting with realtime state:

- `client.chat` - Send/edit/delete messages, toggle reactions, load history.
- `client.presence` - Track online/offline statuses.
- `client.typing` - Track user typing events.
- `client.rooms` - Join/leave room multiplexing.
- `client.session` - Authentication & lifecycle session state.
- `client.events` - The raw event router.

## Contract Test Suite

If you are building your own custom transport, database, or storage adapter, you can validate it against our official Contract Test Suite to guarantee compatibility with RealtimeJS:

```typescript
import { runTransportAdapterContractTests } from '@realtimejs/core/src/adapters/ContractTestSuite';
```

## License

MIT License. See the repository root for details.
