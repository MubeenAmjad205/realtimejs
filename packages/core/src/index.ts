export const VERSION = '0.1.0';

export * from './adapters';
export * from './registry/AdapterRegistry';

// Core Modules
export * from './runtime/ConnectionManager';
export * from './runtime/EventRouter';
export * from './rooms/RoomManager';
export * from './chat/ChatModule';
export * from './presence/PresenceModule';
export * from './typing/TypingModule';

import { createAdapterRegistry, AdapterRegistryState } from './registry/AdapterRegistry';
import { createConnectionManager } from './runtime/ConnectionManager';
import { createEventRouter } from './runtime/EventRouter';
import { createRoomManager } from './rooms/RoomManager';
import { createChatModule } from './chat/ChatModule';
import { createPresenceModule } from './presence/PresenceModule';
import { createTypingModule } from './typing/TypingModule';

export function createRealtime(config: AdapterRegistryState) {
  const registry = createAdapterRegistry(config);

  // Validate that transport is provided at minimum.
  registry.getTransport();

  const connection = createConnectionManager(registry);
  const events = createEventRouter(registry);
  
  const rooms = createRoomManager(events);
  const chat = createChatModule(events, registry);
  const presence = createPresenceModule(events);
  const typing = createTypingModule(events);

  return {
    registry,
    connection,
    events,
    rooms,
    chat,
    presence,
    typing,
  };
}
