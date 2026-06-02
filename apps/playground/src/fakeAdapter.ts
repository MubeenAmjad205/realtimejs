import type { TransportAdapter, StorageAdapter, DatabaseAdapter } from '@realtimejs/core';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function createFakeStorage(): StorageAdapter {
  return {
    upload: async (path: string, file: Uint8Array, mimeType: string) => {
      // Simulate network delay for upload
      await new Promise(resolve => setTimeout(resolve, 800));
      // Just create a blob URL from the data so it works locally for the session
      const blob = new Blob([file], { type: mimeType });
      return URL.createObjectURL(blob);
    },
    download: async (path: string) => {
      // Fake download returning empty byte array
      return new Uint8Array();
    },
    delete: async (path: string) => {
      return true;
    },
    getUrl: async (path: string) => {
      return `blob:${path}`;
    }
  };
}

export function createFakeDatabase(): DatabaseAdapter {
  const MOCK_HISTORY: Record<string, unknown[]> = {
    'product-sync': [
      { id: 'msg-1', roomId: 'product-sync', userId: 'alice', content: 'Did we finish the release notes?', createdAt: Date.now() - 4000000, status: 'read' },
      { id: 'msg-2', roomId: 'product-sync', userId: 'bob', content: 'Yes, just waiting on design.', createdAt: Date.now() - 3800000, status: 'read' },
      { id: 'msg-3', roomId: 'product-sync', userId: 'user-999', content: 'Are we launching today?', createdAt: Date.now() - 3600000, status: 'read' },
    ],
    'alice-dm': [
      { id: 'msg-4', roomId: 'alice-dm', userId: 'alice', content: 'Hey, can you review my PR?', createdAt: Date.now() - 86500000, status: 'read' },
      { id: 'msg-5', roomId: 'alice-dm', userId: 'alice', content: 'Can you check the PR?', createdAt: Date.now() - 86400000, status: 'read' },
    ]
  };

  return {
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => true,
    find: async () => null,
    findMany: async (collection, query: Record<string, string>) => {
      // Simulate pagination delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If asking for chat history for a specific room
      if (collection === 'messages' && query && query.roomId) {
        return MOCK_HISTORY[query.roomId] || [];
      }
      return []; 
    }
  };
}

export function createFakeAdapter(): TransportAdapter {
  const listeners: Record<string, Function[]> = {};
  let connected = true;

  const emitToClient = (event: string, payload: unknown) => {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(payload));
    }
  };

  return {
    connect: async () => { connected = true; },
    disconnect: async () => { connected = false; },
    isConnected: () => connected,
    onConnect: (cb) => {
      // simulate instant connect
      setTimeout(cb, 10);
      return () => {};
    },
    onDisconnect: (cb) => { return () => {}; },
    
    emit: async (event, payload: unknown) => {
      if (event === 'chat:send_message') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock server response
        const serverMsg = {
          ...payload,
          id: generateId(),
          status: 'sent',
          createdAt: Date.now()
        };
        
        // Echo back the confirmed message
        emitToClient('chat:message', serverMsg);
        return serverMsg;
      }
      
      if (event === 'chat:toggle_reaction') {
        await new Promise(resolve => setTimeout(resolve, 300));
        emitToClient('chat:reaction_changed', payload);
        return;
      }
      
      if (event === 'chat:reaction_changed') {
        emitToClient('chat:reaction_changed', payload);
        return payload;
      }
      
      if (event === 'chat:message') {
        emitToClient('chat:message', payload);
        
        // Simulate "delivered" after 1 second for outgoing messages
        setTimeout(() => {
          emitToClient('chat:message_status', { messageId: payload.id, status: 'delivered' });
        }, 1000);
        
        // Simulate "read" after 2.5 seconds for outgoing messages
        setTimeout(() => {
          emitToClient('chat:message_status', { messageId: payload.id, status: 'read' });
        }, 2500);

        return payload;
      }

      if (event === 'chat:message_status') {
        emitToClient('chat:message_status', payload);
        return payload;
      }
    },
    
    subscribe: (event, cb) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
      return () => {
        listeners[event] = listeners[event].filter(l => l !== cb);
      };
    }
  };
}
