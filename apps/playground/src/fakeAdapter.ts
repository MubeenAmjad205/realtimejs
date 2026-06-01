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
      throw new Error('Not implemented in fake');
    },
    delete: async (path: string) => {
      return true;
    }
  };
}

export function createFakeDatabase(): DatabaseAdapter {
  return {
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => true,
    find: async () => null,
    findMany: async () => {
      // Simulate pagination delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return []; // Return an empty array so "Load older messages" finishes without crashing
    }
  };
}

export function createFakeAdapter(): TransportAdapter {
  const listeners: Record<string, Function[]> = {};
  let connected = true;

  const emitToClient = (event: string, payload: any) => {
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
    
    emit: async (event, payload: any) => {
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
