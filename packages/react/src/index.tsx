import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export function useRealtime(): RealtimeInstance {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export function useChat(roomId: string, userId: string) {
  const client = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    client.rooms.join(roomId).catch(console.error);

    const unsubscribe = client.chat.onMessage((msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      unsubscribe();
      client.rooms.leave(roomId).catch(console.error);
    };
  }, [client, roomId]);

  const sendMessage = async (content: string) => {
    await client.chat.sendMessage(roomId, content, userId);
  };

  return {
    messages,
    sendMessage,
  };
}

export function usePresence() {
  const client = useRealtime();
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceUpdate>>({});

  useEffect(() => {
    const unsubscribe = client.presence.onPresenceUpdate((update) => {
      setPresenceMap((prev) => ({
        ...prev,
        [update.userId]: update,
      }));
    });
    return () => { unsubscribe(); };
  }, [client]);

  const setStatus = async (userId: string, status: UserStatus) => {
    await client.presence.setStatus(userId, status);
  };

  return {
    presenceMap,
    setStatus,
  };
}

export function useTyping(roomId: string, userId: string) {
  const client = useRealtime();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = client.typing.onTypingChange((event) => {
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

  const startTyping = async () => client.typing.startTyping(roomId, userId);
  const stopTyping = async () => client.typing.stopTyping(roomId, userId);

  return {
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
  };
}

// UI Components
export * from './ui/ChatRoom';
export * from './ui/MessageList';
export * from './ui/MessageInput';
export * from './ui/TypingIndicator';
