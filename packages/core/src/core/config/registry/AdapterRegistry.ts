import {
  TransportAdapter,
  DatabaseAdapter,
  AuthAdapter,
  StorageAdapter,
  CacheAdapter,
} from '../../../adapters';

export interface AdapterRegistryState {
  transport?: TransportAdapter;
  database?: DatabaseAdapter;
  auth?: AuthAdapter;
  storage?: StorageAdapter;
  cache?: CacheAdapter;
}

export function createAdapterRegistry(initialState: AdapterRegistryState = {}) {
  const state: AdapterRegistryState = { ...initialState };

  return {
    registerTransport: (adapter: TransportAdapter) => {
      state.transport = adapter;
    },
    registerDatabase: (adapter: DatabaseAdapter) => {
      state.database = adapter;
    },
    registerAuth: (adapter: AuthAdapter) => {
      state.auth = adapter;
    },
    registerStorage: (adapter: StorageAdapter) => {
      state.storage = adapter;
    },
    registerCache: (adapter: CacheAdapter) => {
      state.cache = adapter;
    },

    getTransport: (): TransportAdapter => {
      if (!state.transport) {
        throw new Error('Transport adapter is strictly required but not registered.');
      }
      return state.transport;
    },
    getDatabase: () => state.database,
    getAuth: () => state.auth,
    getStorage: () => state.storage,
    getCache: () => state.cache,
  };
}

export type AdapterRegistry = ReturnType<typeof createAdapterRegistry>;
