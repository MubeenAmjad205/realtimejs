import { AdapterRegistry } from '../core/config/registry/AdapterRegistry';

export function createConnectionManager(registry: AdapterRegistry) {
  const transport = registry.getTransport();
  
  return {
    connect: async () => {
      await transport.connect();
    },
    disconnect: async () => {
      await transport.disconnect();
    },
    isConnected: () => transport.isConnected(),
  };
}
