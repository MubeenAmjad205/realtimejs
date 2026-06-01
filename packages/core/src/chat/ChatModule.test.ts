import { expect, test, describe, vi } from 'vitest';
import { createChatModule } from './ChatModule';
import { createEventRouter } from '../runtime/EventRouter';
import { createAdapterRegistry } from '../registry/AdapterRegistry';
import type { TransportAdapter } from '../adapters/TransportAdapter';

describe('ChatModule', () => {
  test('sendMessage should emit chat:message to transport', async () => {
    const listeners = new Map<string, Set<Function>>();
    let emittedEvent: string | null = null;
    let emittedPayload: any = null;

    const mockTransport: TransportAdapter = {
      connect: async () => {},
      disconnect: async () => {},
      emit: async (event, payload) => {
        emittedEvent = event;
        emittedPayload = payload;
      },
      subscribe: (event, callback) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(callback);
      },
      unsubscribe: () => {},
      isConnected: () => true,
    };

    const registry = createAdapterRegistry({ transport: mockTransport });
    const events = createEventRouter(registry);
    const chat = createChatModule(events, registry);

    const sentMessage = await chat.sendMessage('room-1', 'hello world', 'user-1');

    expect(emittedEvent).toBe('chat:message');
    expect(emittedPayload).toEqual(sentMessage);
    expect(sentMessage.roomId).toBe('room-1');
    expect(sentMessage.content).toBe('hello world');
  });

  test('onMessage should receive events from transport', () => {
    const listeners = new Map<string, Set<Function>>();
    
    const mockTransport: TransportAdapter = {
      connect: async () => {},
      disconnect: async () => {},
      emit: async () => {},
      subscribe: (event, callback) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(callback);
      },
      unsubscribe: () => {},
      isConnected: () => true,
    };

    const registry = createAdapterRegistry({ transport: mockTransport });
    const events = createEventRouter(registry);
    const chat = createChatModule(events, registry);

    const received: any[] = [];
    chat.onMessage((msg) => received.push(msg));

    // Simulate transport receiving an event from the server
    const fakeMessage = { id: '1', roomId: 'room-1', userId: 'user-2', content: 'test', createdAt: 123 };
    listeners.get('chat:message')?.forEach(cb => cb(fakeMessage));

    expect(received.length).toBe(1);
    expect(received[0]).toEqual(fakeMessage);
  });
});
