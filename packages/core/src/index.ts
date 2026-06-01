export const VERSION = '0.1.0';

export * from './adapters';
export * from './core/config/registry/AdapterRegistry';

// Core Modules
export * from './runtime/ConnectionManager';
export * from './runtime/EventRouter';
export * from './features/rooms/RoomManager';
export * from './features/chat/ChatModule';
export * from './features/presence/PresenceModule';
export * from './features/typing/TypingModule';

import { createAdapterRegistry, AdapterRegistryState } from './core/config/registry/AdapterRegistry';
import { createConnectionManager } from './runtime/ConnectionManager';
import { createEventRouter } from './runtime/EventRouter';
import { createRoomManager } from './features/rooms/RoomManager';
import { createChatModule } from './features/chat/ChatModule';
import { createPresenceModule } from './features/presence/PresenceModule';
import { createTypingModule } from './features/typing/TypingModule';

// Constants
export * from './shared/constants/flags';
export * from './shared/constants/config';
import { FEATURE_FLAGS } from './shared/constants/flags';

export function createRealtime(config: AdapterRegistryState) {
  const registry = createAdapterRegistry(config);

  // Validate that transport is provided at minimum.
  registry.getTransport();

  const connection = createConnectionManager(registry);
  const events = createEventRouter(registry);
  
  const rooms = createRoomManager(events);
  
  // Conditionally load features based on mandatory feature flags
  const chat = FEATURE_FLAGS.ENABLE_CHAT ? createChatModule(events, registry) : null;
  const presence = FEATURE_FLAGS.ENABLE_PRESENCE ? createPresenceModule(events) : null;
  const typing = FEATURE_FLAGS.ENABLE_TYPING ? createTypingModule(events) : null;

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
