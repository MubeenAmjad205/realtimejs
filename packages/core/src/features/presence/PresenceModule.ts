import { EventRouter } from '../../runtime/EventRouter';
import type { UserStatus, PresenceUpdate } from '../../shared/types';
import { getCurrentTimestamp } from '../../shared/utils';

export function createPresenceModule(eventRouter: EventRouter) {
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
      await eventRouter.emit('presence:update', update);
    },
    onPresenceUpdate: (callback: (update: PresenceUpdate) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}
