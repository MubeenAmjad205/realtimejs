import { EventRouter } from '../../runtime/EventRouter';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import type { SessionState } from '../../shared/types';
import { generateId, getCurrentTimestamp } from '../../shared/utils';

export function createSessionManager(events: EventRouter, registry: AdapterRegistry) {
  let state: SessionState = {
    sessionId: null,
    userId: null,
    token: null,
    isAuthenticated: false,
    lastActive: getCurrentTimestamp(),
  };

  const authAdapter = registry.getAuth();

  return {
    authenticate: async (token: string) => {
      if (!authAdapter) {
        throw new Error('AuthAdapter is not registered.');
      }
      
      const user = await authAdapter.getUser(token) as any;
      if (!user) throw new Error('Invalid token');
      
      state = {
        sessionId: generateId(),
        userId: user.id || user.userId || 'unknown',
        token,
        isAuthenticated: true,
        lastActive: getCurrentTimestamp(),
      };
      
      await events.emit('session:authenticated', state);
      return state;
    },
    
    logout: async () => {
      state = {
        sessionId: null,
        userId: null,
        token: null,
        isAuthenticated: false,
        lastActive: getCurrentTimestamp(),
      };
      
      await events.emit('session:logged_out', null);
    },
    
    getSession: () => ({ ...state }),
    
    refreshActivity: () => {
      state.lastActive = getCurrentTimestamp();
    }
  };
}
