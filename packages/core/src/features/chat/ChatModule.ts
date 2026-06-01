import { EventRouter } from '../../runtime/EventRouter';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import type { Message } from '../../shared/types';
import { generateId, getCurrentTimestamp } from '../../shared/utils';

export function createChatModule(eventRouter: EventRouter, registry: AdapterRegistry) {
  const db = registry.getDatabase(); // Optional Database
  const storage = registry.getStorage(); // Optional Storage
  
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
    sendMessage: async (roomId: string, content: string, userId: string, threadId?: string, attachments?: File[]) => {
      let uploadedAttachments: any[] = [];
      
      if (attachments && attachments.length > 0) {
        if (!storage) {
          throw new Error('Storage adapter is required to upload attachments.');
        }
        
        uploadedAttachments = await Promise.all(attachments.map(async (file) => {
          const buffer = new Uint8Array(await file.arrayBuffer());
          const url = await storage.upload(`chat/${roomId}/${generateId()}`, buffer, file.type);
          return {
            id: generateId(),
            url,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            size: file.size
          };
        }));
      }

      const message: Message = {
        id: generateId(),
        roomId,
        userId,
        content,
        createdAt: getCurrentTimestamp(),
        ...(threadId ? { threadId } : {}),
        ...(uploadedAttachments.length > 0 ? { attachments: uploadedAttachments } : {}),
      };
      
      if (db) {
        await db.create('messages', message);
      }

      await eventRouter.emit('chat:message', message);
      return message;
    },
    
    editMessage: async (messageId: string, content: string) => {
      const editedAt = getCurrentTimestamp();
      
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
