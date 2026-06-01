import { EventRouter } from '../../runtime/EventRouter';

export interface TypingEvent {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export function createTypingModule(eventRouter: EventRouter) {
  const listeners: Set<(event: TypingEvent) => void> = new Set();
  
  eventRouter.on('typing:status', (payload: TypingEvent) => {
    listeners.forEach(listener => listener(payload));
  });

  return {
    startTyping: async (roomId: string, userId: string) => {
      await eventRouter.emit('typing:status', { roomId, userId, isTyping: true });
    },
    stopTyping: async (roomId: string, userId: string) => {
      await eventRouter.emit('typing:status', { roomId, userId, isTyping: false });
    },
    onTypingChange: (callback: (event: TypingEvent) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}
