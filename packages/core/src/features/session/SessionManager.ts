import { EventRouter } from '../../runtime/EventRouter';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import type { SessionState } from '../../shared/types';
import { generateId, getCurrentTimestamp } from '../../shared/utils';
import { RealtimeError, ERROR_CODES } from '../../shared/utils/errors';

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
        throw new RealtimeError(ERROR_CODES.AUTH_ADAPTER_MISSING, 'AuthAdapter is not registered');
      }
      
      const user = await authAdapter.getUser(token) as { id?: string; userId?: string };
      if (!user) throw new RealtimeError(ERROR_CODES.INVALID_TOKEN, 'Invalid token');
      
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
