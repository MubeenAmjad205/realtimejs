import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { 
  createRealtime, 
  Message, 
  PresenceUpdate, 
  TypingEvent, 
  UserStatus 
} from '@realtimejs/core';

export type RealtimeInstance = ReturnType<typeof createRealtime>;

const RealtimeContext = createContext<RealtimeInstance | null>(null);

export interface RealtimeProviderProps {
  client: RealtimeInstance;
  children: ReactNode;
}

export function RealtimeProvider({ client, children }: RealtimeProviderProps) {
  useEffect(() => {
    // Automatically connect the transport on mount
    client.connection.connect().catch((err: unknown) => {
      console.error('Failed to connect RealtimeJS:', err);
    });
    
    // Disconnect when provider unmounts
    return () => {
      client.connection.disconnect().catch(console.error);
    };
  }, [client]);

  return (
    <RealtimeContext.Provider value={client}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const ChatContext = createContext<{ roomId: string; userId: string } | null>(null);
export function ChatProvider({ roomId, userId, children }: { roomId: string; userId: string; children: ReactNode }) {
  return <ChatContext.Provider value={{ roomId, userId }}>{children}</ChatContext.Provider>;
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  return <>{children}</>; // Presence logic relies on RealtimeProvider
}

export function TypingProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useRealtime(): RealtimeInstance {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export function useChat(roomId: string, userId: string) {
  const client = useRealtime();
  
  if (!client.chat) {
    throw new Error('Chat module is disabled by feature flags.');
  }
  
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([]);
    client.rooms.join(roomId).catch(console.error);

    const unsubMessage = client.chat!.onMessage((msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) {
            return prev.map(m => m.id === msg.id ? msg : m);
          }
          return [...prev, msg];
        });
      }
    });

    const unsubEdit = client.chat!.onMessageEdited((editedMsg) => {
      setMessages((prev) => prev.map(m => m.id === editedMsg.id ? { ...m, ...editedMsg } : m));
    });

    const unsubDelete = client.chat!.onMessageDeleted((messageId) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
    });

    const unsubReact = client.chat!.onReactionChanged((payload) => {
      setMessages((prev) => prev.map(m => {
        if (m.id === payload.messageId) {
          const reactions = m.reactions ? { ...m.reactions } : {};
          const users = reactions[payload.emoji] || [];
          if (users.includes(payload.userId)) {
            reactions[payload.emoji] = users.filter(id => id !== payload.userId);
            if (reactions[payload.emoji].length === 0) delete reactions[payload.emoji];
          } else {
            reactions[payload.emoji] = [...users, payload.userId];
          }

          return { ...m, reactions };
        }
        return m;
      }));
    });

    const unsubStatus = client.chat!.onMessageStatus((payload) => {
      setMessages((prev) => prev.map(m => m.id === payload.messageId ? { ...m, status: payload.status } : m));
    });

    return () => {
      unsubMessage();
      unsubEdit();
      unsubDelete();
      unsubReact();
      unsubStatus();
      client.rooms.leave(roomId).catch(console.error);
    };
  }, [client, roomId]);

  const sendMessage = useCallback(async (content: string, threadId?: string, attachments?: File[]) => {
    const tempId = 'temp-' + Date.now();
    
    const optAttachments = attachments?.map(file => ({
      id: `opt-${Math.random()}`,
      url: URL.createObjectURL(file),
      type: (file.type.startsWith('image/') ? 'image' : 'file') as 'image' | 'video' | 'file',
      size: file.size
    }));

    const tempMessage: Message = { 
      id: tempId, 
      roomId, 
      userId, 
      content, 
      createdAt: Date.now(), 
      status: 'sending', 
      ...(threadId ? { threadId } : {}),
      ...(optAttachments && optAttachments.length > 0 ? { attachments: optAttachments } : {})
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    try {
      const realMessage = await client.chat!.sendMessage(roomId, content, userId, threadId, attachments);
      setMessages((prev) => {
        const withoutTemp = prev.filter(m => m.id !== tempId);
        if (withoutTemp.some(m => m.id === realMessage.id)) return withoutTemp;
        return [...withoutTemp, realMessage];
      });
    } catch (error) {
      setMessages((prev) => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      throw error;
    }
  }, [client, roomId, userId]);
  
  const editMessage = useCallback(async (messageId: string, content: string) => {
    setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, content, editedAt: Date.now() } : m));
    try {
      await client.chat!.editMessage(messageId, content, userId);
    } catch (error) {
      console.error(error);
    }
  }, [client, userId]);
  
  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
    try {
      await client.chat!.deleteMessage(messageId, userId);
    } catch (error) {
      console.error(error);
    }
  }, [client, userId]);
  
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await client.chat!.toggleReaction(messageId, emoji, userId);
    } catch (err) {
      console.error('toggleReaction error:', err);
    }
  }, [client, userId]);
  
  const loadHistory = useCallback(async (limit?: number, cursor?: string) => {
    const history = await client.chat!.getMessages(roomId, limit, cursor);
    setMessages((prev) => [...history, ...prev]);
    return history;
  }, [client, roomId]);

  const markRead = useCallback(async (messageId: string) => {
    try {
      await client.chat!.markRead(messageId);
    } catch (error) {
      console.error('[DEBUG] markRead error:', error);
    }
  }, [client]);

  const retry = useCallback(async (messageId: string) => {
    try {
      await client.chat!.retry(messageId);
    } catch (error) {
      console.error('[DEBUG] retry error:', error);
    }
  }, [client]);

  return { messages, sendMessage, editMessage, deleteMessage, toggleReaction, loadHistory, markRead, retry };
}

export function useMessages() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useMessages requires ChatProvider');
  const chat = useChat(ctx.roomId, ctx.userId);
  return { messages: chat.messages, loadHistory: chat.loadHistory };
}

export function useSendMessage() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useSendMessage requires ChatProvider');
  const chat = useChat(ctx.roomId, ctx.userId);
  return chat.sendMessage;
}

export function usePresence() {
  const client = useRealtime();

  if (!client.presence) {
    throw new Error('Presence module is disabled by feature flags.');
  }

  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceUpdate>>({});

  useEffect(() => {
    const unsubscribe = client.presence!.onPresenceUpdate((update) => {
      setPresenceMap((prev) => ({
        ...prev,
        [update.userId]: update,
      }));
    });
    return () => { unsubscribe(); };
  }, [client]);

  const setStatus = async (userId: string, status: UserStatus) => {
    await client.presence!.setStatus(userId, status);
  };

  return {
    presenceMap,
    setStatus,
  };
}

export function useTyping(roomId: string, userId: string) {
  const client = useRealtime();

  if (!client.typing) {
    throw new Error('Typing module is disabled by feature flags.');
  }

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = client.typing!.onTypingChange((event) => {
      if (event.roomId === roomId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (event.isTyping) {
            next.add(event.userId);
          } else {
            next.delete(event.userId);
          }
          return next;
        });
      }
    });
    return () => { unsubscribe(); };
  }, [client, roomId]);

  const startTyping = async () => client.typing!.startTyping(roomId, userId);
  const stopTyping = async () => client.typing!.stopTyping(roomId, userId);

  return {
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
  };
}

export function useRoom(roomId: string) {
  const client = useRealtime();

  const join = async (metadata?: Record<string, unknown>) => {
    await client.rooms.join(roomId, metadata);
  };

  const leave = async () => {
    await client.rooms.leave(roomId);
  };

  return {
    join,
    leave,
  };
}

// UI Components
export * from './ui/ChatRoom';
export * from './ui/MessageList';
export * from './ui/MessageInput';
export * from './ui/TypingIndicator';
export * from './ui/UserAvatar';
export * from './ui/MessageItem';
export * from './ui/OnlineUsers';
export * from './ui/Chat';
export * from './ui/Sidebar';
export * from './ui/ChatLayout';
export * from './ui/Modal';
export * from './ui/GroupInfoPane';

// Config & Features
export * from './config/features';
export * from './config/ui';
export * from './config/ConfigProvider';
