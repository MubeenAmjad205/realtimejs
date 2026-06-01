# @realtimejs/adapter-websocket

> Native WebSocket transport adapter for RealtimeJS.

![RealtimeJS](https://img.shields.io/badge/RealtimeJS-Adapter-orange.svg)
![WebSocket](https://img.shields.io/badge/Native-WebSocket-black.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

`@realtimejs/adapter-websocket` is the official native WebSocket transport layer for the RealtimeJS core engine. It utilizes the browser's native `WebSocket` API, requiring absolutely no third-party dependencies.

## Features

- Fully implements the `TransportAdapter` interface.
- **Zero dependencies** (uses native browser APIs).
- Extremely lightweight.
- Compatible with Edge functions, Deno, and modern environments.

## Installation

```bash
npm install @realtimejs/adapter-websocket
```

## Usage

```typescript
import { createRealtime } from '@realtimejs/core';
import { createWebSocketAdapter } from '@realtimejs/adapter-websocket';

// Create the adapter pointing to your ws:// or wss:// backend
const transport = createWebSocketAdapter('wss://your-websocket-server.com/ws');

// Inject into RealtimeJS
const client = createRealtime({ transport });

await client.connection.connect();
```

## When to use this vs Socket.IO?

Use `@realtimejs/adapter-websocket` when:
- You are connecting to a backend that speaks raw WebSockets (e.g., Go/Rust/Elixir servers).
- You want the absolute smallest bundle size possible.
- You do not need long-polling fallbacks for old browsers.

## License

MIT License. See the repository root for details.
