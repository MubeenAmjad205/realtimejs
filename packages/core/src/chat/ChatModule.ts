import { EventRouter } from '../runtime/EventRouter';
import { AdapterRegistry } from '../registry/AdapterRegistry';

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: number;
}

export function createChatModule(eventRouter: EventRouter, registry: AdapterRegistry) {
  const listeners: Set<(message: Message) => void> = new Set();

  eventRouter.on('chat:message', (payload: Message) => {
    listeners.forEach(listener => listener(payload));
  });

  return {
    sendMessage: async (roomId: string, content: string, userId: string) => {
      // In a real environment, we'd use a better ID generator
      const message: Message = {
        id: Math.random().toString(36).substring(2, 15),
        roomId,
        userId,
        content,
        createdAt: Date.now(),
      };
      
      await eventRouter.emit('chat:message', message);
      return message;
    },
    onMessage: (callback: (message: Message) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}
