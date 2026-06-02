import { AdapterRegistry } from '../core/config/registry/AdapterRegistry';

export type EventHandler = (payload: unknown) => void;

export function createEventRouter(registry: AdapterRegistry) {
  const transport = registry.getTransport();
  
  return {
    on: (event: string, handler: EventHandler) => {
      transport.subscribe(event, handler);
    },
    off: (event: string) => {
      transport.unsubscribe(event);
    },
    emit: async (event: string, payload: unknown) => {
      await transport.emit(event, payload);
    }
  };
}

export type EventRouter = ReturnType<typeof createEventRouter>;
