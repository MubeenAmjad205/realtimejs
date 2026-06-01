# @realtimejs/adapter-socketio

> Socket.IO transport adapter for RealtimeJS.

![RealtimeJS](https://img.shields.io/badge/RealtimeJS-Adapter-orange.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-black.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

`@realtimejs/adapter-socketio` is the official Socket.IO transport layer for the RealtimeJS core engine. It bridges the gap between Socket.IO's bidirectional event architecture and RealtimeJS's standard adapter contract.

## Features

- Fully implements the `TransportAdapter` interface.
- Automatic reconnection & fallback polling (inherited from Socket.IO).
- Zero setup configuration required beyond the server URL.

## Installation

```bash
npm install @realtimejs/adapter-socketio socket.io-client
```

## Usage

```typescript
import { createRealtime } from '@realtimejs/core';
import { createSocketIOAdapter } from '@realtimejs/adapter-socketio';

// Create the adapter
const transport = createSocketIOAdapter('https://your-socket-server.com');

// Inject into RealtimeJS
const client = createRealtime({ transport });

await client.connection.connect();
```

## Peer Dependencies

This package requires `socket.io-client` to be installed in your project.

## License

MIT License. See the repository root for details.
