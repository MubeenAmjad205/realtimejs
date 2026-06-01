import { describe, it, expect, vi } from 'vitest';
import { createSessionManager } from './SessionManager';
import { createEventRouter } from '../../runtime/EventRouter';
import { createAdapterRegistry } from '../../core/config/registry/AdapterRegistry';

describe('SessionManager', () => {
  it('should authenticate user via AuthAdapter', async () => {
    const mockAuth = {
      authenticate: async () => {},
      getUser: async () => ({ id: 'user1' }),
    };
    
    const mockTransport = { emit: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn(), isConnected: () => true, onConnect: vi.fn(), onDisconnect: vi.fn(), onError: vi.fn() };
    const registry = createAdapterRegistry({ transport: mockTransport as any });
    registry.registerAuth(mockAuth as any);
    const events = createEventRouter(registry);
    const session = createSessionManager(events, registry);
    
    const state = await session.authenticate('token123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.userId).toBe('user1');
    expect(state.token).toBe('token123');
  });

  it('should logout user', async () => {
    const mockTransport = { emit: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn(), isConnected: () => true, onConnect: vi.fn(), onDisconnect: vi.fn(), onError: vi.fn() };
    const registry = createAdapterRegistry({ transport: mockTransport as any });
    const events = createEventRouter(registry);
    const session = createSessionManager(events, registry);
    
    await session.logout();
    const state = session.getSession();
    expect(state.isAuthenticated).toBe(false);
  });
});
