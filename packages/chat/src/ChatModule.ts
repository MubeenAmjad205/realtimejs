import { EventRouter } from '@realtimejs/events';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import type { Message, MessageStatus } from '@realtimejs/shared';
import { generateId, getCurrentTimestamp } from '@realtimejs/shared';
import { RealtimeError, ERROR_CODES } from '@realtimejs/shared';

export interface ChatPermissions {
  canSend?: (userId: string, roomId: string) => boolean | Promise<boolean>;
  canEdit?: (userId: string, messageId: string) => boolean | Promise<boolean>;
  canDelete?: (userId: string, messageId: string) => boolean | Promise<boolean>;
}

export function createChatModule(eventRouter: EventRouter, registry: AdapterRegistry, permissions?: ChatPermissions) {
  const db = registry.getDatabase();
  const storage = registry.getStorage();
  const transport = registry.getTransport();
  
  const listeners: Set<(message: Message) => void> = new Set();
  const editListeners: Set<(message: Partial<Message>) => void> = new Set();
  const deleteListeners: Set<(messageId: string) => void> = new Set();
  const reactionListeners: Set<(data: unknown) => void> = new Set();
  const statusListeners: Set<(data: { messageId: string; status: MessageStatus }) => void> = new Set();

  type Mutation = 
    | { type: 'send'; payload: Message }
    | { type: 'edit'; payload: { id: string; content: string; editedAt: number } }
    | { type: 'delete'; payload: { messageId: string } }
    | { type: 'react'; payload: { messageId: string; emoji: string; userId: string } };

  const mutationQueue: Mutation[] = [];

  eventRouter.on('chat:message', (payload: unknown) => listeners.forEach(l => l(payload as Message)));
  eventRouter.on('chat:message_edited', (payload: unknown) => editListeners.forEach(l => l(payload as Partial<Message>)));
  eventRouter.on('chat:message_deleted', (payload: unknown) => deleteListeners.forEach(l => l((payload as { messageId: string }).messageId)));
  eventRouter.on('chat:reaction_changed', (payload: unknown) => reactionListeners.forEach(l => l(payload)));
  eventRouter.on('chat:message_status', (payload: unknown) => statusListeners.forEach(l => l(payload as { messageId: string; status: MessageStatus })));


  transport.onConnect(async () => {
    while (mutationQueue.length > 0) {
      const mutation = mutationQueue.shift()!;
      if (mutation.type === 'send') await eventRouter.emit('chat:message', { ...mutation.payload, status: 'sent' });
      else if (mutation.type === 'edit') await eventRouter.emit('chat:message_edited', mutation.payload);
      else if (mutation.type === 'delete') await eventRouter.emit('chat:message_deleted', mutation.payload);
      else if (mutation.type === 'react') await eventRouter.emit('chat:reaction_changed', mutation.payload);
    }
  });

  const chat = {
    sendMessage: async (roomId: string, content: string, userId: string, threadId?: string, attachments?: File[]) => {
      if (permissions?.canSend && !(await permissions.canSend(userId, roomId))) {
        throw new RealtimeError(ERROR_CODES.FEATURE_DISABLED, 'Not allowed to send message');
      }

      let uploadedAttachments: unknown[] = [];
      if (attachments && attachments.length > 0) {
        if (!storage) throw new RealtimeError(ERROR_CODES.STORAGE_ADAPTER_MISSING, 'Storage adapter is required');
        uploadedAttachments = await Promise.all(attachments.map(async (file) => {
          const buffer = new Uint8Array(await file.arrayBuffer());
          const url = await storage.upload(`chat/${roomId}/${generateId()}`, buffer, file.type);
          return { id: generateId(), url, type: file.type.startsWith('image/') ? 'image' : 'file', size: file.size };
        }));
      }

      const message: Message = {
        id: generateId(),
        roomId,
        userId,
        content,
        createdAt: getCurrentTimestamp(),
        status: transport.isConnected() ? 'sent' : 'sending',
        ...(threadId ? { threadId } : {}),
        ...(uploadedAttachments.length > 0 ? { attachments: uploadedAttachments } : {}),
      };
      
      if (db) await db.create('messages', message);

      if (!transport.isConnected()) {
        mutationQueue.push({ type: 'send', payload: message });
        return message;
      }

      await eventRouter.emit('chat:message', message);
      return message;
    },
    
    editMessage: async (messageId: string, content: string, userId: string) => {
      if (permissions?.canEdit && !(await permissions.canEdit(userId, messageId))) {
        throw new RealtimeError(ERROR_CODES.FEATURE_DISABLED, 'Not allowed to edit message');
      }
      const editedAt = getCurrentTimestamp();
      if (db) await db.update('messages', messageId, { content, editedAt });
      const payload = { id: messageId, content, editedAt };
      if (!transport.isConnected()) {
        mutationQueue.push({ type: 'edit', payload });
        return payload;
      }
      await eventRouter.emit('chat:message_edited', payload);
      return payload;
    },
    
    deleteMessage: async (messageId: string, userId: string) => {
      if (permissions?.canDelete && !(await permissions.canDelete(userId, messageId))) {
        throw new RealtimeError(ERROR_CODES.FEATURE_DISABLED, 'Not allowed to delete message');
      }
      if (db) await db.update('messages', messageId, { isDeleted: true });
      if (!transport.isConnected()) {
        mutationQueue.push({ type: 'delete', payload: { messageId } });
        return messageId;
      }
      await eventRouter.emit('chat:message_deleted', { messageId });
      return messageId;
    },
    
    toggleReaction: async (messageId: string, emoji: string, userId: string) => {
      const payload = { messageId, emoji, userId };
      if (db) await db.update('reactions', messageId, payload);
      if (!transport.isConnected()) {
        mutationQueue.push({ type: 'react', payload });
        return payload;
      }
      await eventRouter.emit('chat:reaction_changed', payload);
      return payload;
    },
    
    markRead: async (messageId: string) => {
      if (db) await db.update('messages', messageId, { status: 'read' });
      await eventRouter.emit('chat:message_status', { messageId, status: 'read' });
    },

    retry: async (messageId: string) => {
      const msgIndex = mutationQueue.findIndex(m => m.type === 'send' && m.payload.id === messageId);
      if (msgIndex !== -1 && transport.isConnected()) {
        const mutation = mutationQueue[msgIndex];
        mutationQueue.splice(msgIndex, 1);
        if (mutation.type === 'send') {
          await eventRouter.emit('chat:message', { ...mutation.payload, status: 'sent' });
        }
      }
    },

    search: async (query: string) => {
      if (!db) throw new RealtimeError(ERROR_CODES.DATABASE_ADAPTER_MISSING, 'Database adapter is required to search');
      return db.findMany('messages', { search: query });
    },

    getMessages: async (roomId: string, limit: number = 50, cursor?: string) => {
      if (!db) throw new RealtimeError(ERROR_CODES.DATABASE_ADAPTER_MISSING, 'Database adapter is required to fetch history');
      return db.findMany('messages', { roomId, limit, cursor }) as Promise<Message[]>;
    },

    onMessage: (callback: (message: Message) => void) => { listeners.add(callback); return () => listeners.delete(callback); },
    onMessageEdited: (callback: (message: Partial<Message>) => void) => { editListeners.add(callback); return () => editListeners.delete(callback); },
    onMessageDeleted: (callback: (messageId: string) => void) => { deleteListeners.add(callback); return () => deleteListeners.delete(callback); },
    onReactionChanged: (callback: (data: { messageId: string, emoji: string, userId: string }) => void) => { reactionListeners.add(callback as unknown as (data: unknown) => void); return () => reactionListeners.delete(callback as unknown as (data: unknown) => void); },
    onMessageStatus: (callback: (data: { messageId: string; status: MessageStatus }) => void) => { statusListeners.add(callback); return () => statusListeners.delete(callback); }
  };

  return chat;
}
