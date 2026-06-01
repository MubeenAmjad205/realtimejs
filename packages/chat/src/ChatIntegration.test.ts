import { describe, it, expect, vi } from 'vitest';
import { createEventRouter } from '@realtimejs/events';
import { createAdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import { createChatModule } from './ChatModule';
import { TransportAdapter } from '../../adapters/TransportAdapter';

describe('Chat Integration Flow', () => {
  it('should queue messages while disconnected and send them upon reconnection', async () => {
    let isConnected = true;
    const connectListeners: Set<Function> = new Set();
    const emitSpy = vi.fn();

    const mockTransport = {
      emit: async (event: string, payload: any) => {
        if (!isConnected) throw new Error('Not connected');
        emitSpy(event, payload);
      },
      isConnected: () => isConnected,
      subscribe: () => {},
      unsubscribe: () => {},
      onConnect: (cb: Function) => connectListeners.add(cb),
      onDisconnect: () => {},
      onError: () => {}
    };

    const registry = createAdapterRegistry({ transport: mockTransport as any });
    const events = createEventRouter(registry);
    const chat = createChatModule(events, registry);

    // 1. Send message while connected
    await chat.sendMessage('room1', 'Hello 1', 'user1');
    expect(emitSpy).toHaveBeenCalledWith('chat:message', expect.objectContaining({ content: 'Hello 1', status: 'sent' }));

    // 2. Lose connection
    isConnected = false;
    emitSpy.mockClear();

    // 3. Send message while disconnected (should be queued)
    const msg2 = await chat.sendMessage('room1', 'Hello 2', 'user1');
    expect(msg2.status).toBe('sending');
    expect(emitSpy).not.toHaveBeenCalled();

    // 4. Send another message while disconnected
    const msg3 = await chat.sendMessage('room1', 'Hello 3', 'user1');
    expect(msg3.status).toBe('sending');
    expect(emitSpy).not.toHaveBeenCalled();

    // 5. Reconnect
    isConnected = true;
    for (const cb of connectListeners) {
      await cb();
    }

    // 6. Assert that queued messages were sent
    expect(emitSpy).toHaveBeenCalledWith('chat:message', expect.objectContaining({ content: 'Hello 2', status: 'sent' }));
    expect(emitSpy).toHaveBeenCalledWith('chat:message', expect.objectContaining({ content: 'Hello 3', status: 'sent' }));
  });
});
