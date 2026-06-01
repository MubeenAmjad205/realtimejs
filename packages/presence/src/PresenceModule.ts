import { EventRouter } from '@realtimejs/events';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import type { UserStatus, PresenceUpdate } from '@realtimejs/shared';
import { getCurrentTimestamp } from '@realtimejs/shared';

export function createPresenceModule(eventRouter: EventRouter, registry: AdapterRegistry) {
  const db = registry.getDatabase();
  const listeners: Set<(update: PresenceUpdate) => void> = new Set();
  
  eventRouter.on('presence:update', (payload: PresenceUpdate) => {
    listeners.forEach(listener => listener(payload));
  });

  return {
    setStatus: async (userId: string, status: UserStatus) => {
      const update: PresenceUpdate = {
        userId,
        status,
        lastSeen: getCurrentTimestamp(),
      };
      
      if (db) {
        await db.create('presence_history', update);
      }
      
      await eventRouter.emit('presence:update', update);
    },
    onPresenceUpdate: (callback: (update: PresenceUpdate) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}
