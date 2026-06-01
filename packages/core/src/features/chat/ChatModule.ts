import { EventRouter } from '../../runtime/EventRouter';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: number;
  editedAt?: number;
  isDeleted?: boolean;
  threadId?: string;
  reactions?: Record<string, string[]>;
}

export function createChatModule(eventRouter: EventRouter, registry: AdapterRegistry) {
  const db = registry.getDatabase(); // Optional Database
  
  const listeners: Set<(message: Message) => void> = new Set();
  const editListeners: Set<(message: Partial<Message>) => void> = new Set();
  const deleteListeners: Set<(messageId: string) => void> = new Set();
  const reactionListeners: Set<(data: any) => void> = new Set();

  eventRouter.on('chat:message', (payload: Message) => {
    listeners.forEach(listener => listener(payload));
  });
  
  eventRouter.on('chat:message_edited', (payload: Partial<Message>) => {
    editListeners.forEach(listener => listener(payload));
  });

  eventRouter.on('chat:message_deleted', (payload: { messageId: string }) => {
    deleteListeners.forEach(listener => listener(payload.messageId));
  });

  eventRouter.on('chat:reaction_changed', (payload: any) => {
    reactionListeners.forEach(listener => listener(payload));
  });

  return {
    sendMessage: async (roomId: string, content: string, userId: string, threadId?: string) => {
      const message: Message = {
        id: Math.random().toString(36).substring(2, 15),
        roomId,
        userId,
        content,
        createdAt: Date.now(),
        ...(threadId ? { threadId } : {}),
      };
      
      if (db) {
        await db.create('messages', message);
      }

      await eventRouter.emit('chat:message', message);
      return message;
    },
    
    editMessage: async (messageId: string, content: string) => {
      const editedAt = Date.now();
      
      if (db) {
        await db.update('messages', messageId, { content, editedAt });
      }
      
      const payload = { id: messageId, content, editedAt };
      await eventRouter.emit('chat:message_edited', payload);
      return payload;
    },
    
    deleteMessage: async (messageId: string) => {
      if (db) {
        await db.update('messages', messageId, { isDeleted: true });
      }
      
      await eventRouter.emit('chat:message_deleted', { messageId });
      return messageId;
    },
    
    toggleReaction: async (messageId: string, emoji: string, userId: string) => {
      const payload = { messageId, emoji, userId };
      
      // Complex DB query handling in real implementation
      if (db) {
        await db.update('reactions', messageId, payload);
      }
      
      await eventRouter.emit('chat:reaction_changed', payload);
      return payload;
    },
    
    getMessages: async (roomId: string, limit: number = 50, cursor?: string) => {
      if (!db) {
        throw new Error('Database adapter is not configured. Cannot fetch history.');
      }
      return db.findMany('messages', { roomId, limit, cursor }) as Promise<Message[]>;
    },

    onMessage: (callback: (message: Message) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    onMessageEdited: (callback: (message: Partial<Message>) => void) => {
      editListeners.add(callback);
      return () => editListeners.delete(callback);
    },
    onMessageDeleted: (callback: (messageId: string) => void) => {
      deleteListeners.add(callback);
      return () => deleteListeners.delete(callback);
    },
    onReactionChanged: (callback: (data: any) => void) => {
      reactionListeners.add(callback);
      return () => reactionListeners.delete(callback);
    }
  };
}
