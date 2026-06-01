import { EventRouter } from '../runtime/EventRouter';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface PresenceUpdate {
  userId: string;
  status: UserStatus;
  lastSeen: number;
}

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
        lastSeen: Date.now(),
      };
      await eventRouter.emit('presence:update', update);
    },
    onPresenceUpdate: (callback: (update: PresenceUpdate) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}
