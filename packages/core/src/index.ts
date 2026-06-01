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
export * from './features/session/SessionManager';
export * from './runtime/PluginManager';

import { createAdapterRegistry, AdapterRegistryState } from './core/config/registry/AdapterRegistry';
import { createConnectionManager } from './runtime/ConnectionManager';
import { createEventRouter } from './runtime/EventRouter';
import { createRoomManager } from './features/rooms/RoomManager';
import { createChatModule } from './features/chat/ChatModule';
import { createPresenceModule } from './features/presence/PresenceModule';
import { createTypingModule } from './features/typing/TypingModule';
import { createSessionManager } from './features/session/SessionManager';
import { createPluginManager } from './runtime/PluginManager';

// Constants & Types
export * from './shared/constants/flags';
export * from './shared/constants/config';
export * from './shared/types';
export * from './shared/utils';
export * from './shared/utils/errors';
import { FEATURE_FLAGS } from './shared/constants/flags';

export function createRealtime(config: AdapterRegistryState) {
  const registry = createAdapterRegistry(config);

  // Validate that transport is provided at minimum.
  registry.getTransport();

  const connection = createConnectionManager(registry);
  const events = createEventRouter(registry);
  
  const rooms = createRoomManager(events, registry);
  
  const chat = FEATURE_FLAGS.ENABLE_CHAT ? createChatModule(events, registry) : null;
  const presence = FEATURE_FLAGS.ENABLE_PRESENCE ? createPresenceModule(events, registry) : null;
  const typing = FEATURE_FLAGS.ENABLE_TYPING ? createTypingModule(events) : null;
  const session = createSessionManager(events, registry);
  const plugins = createPluginManager();

  return {
    registry,
    connection,
    events,
    rooms,
    chat,
    presence,
    typing,
    session,
    plugins,
  };
}
