import { AdapterRegistry } from '../registry/AdapterRegistry';

export type EventHandler = (payload: any) => void;

export function createEventRouter(registry: AdapterRegistry) {
  const transport = registry.getTransport();
  
  return {
    on: (event: string, handler: EventHandler) => {
      transport.subscribe(event, handler);
    },
    off: (event: string) => {
      transport.unsubscribe(event);
    },
    emit: async (event: string, payload: any) => {
      await transport.emit(event, payload);
    }
  };
}

export type EventRouter = ReturnType<typeof createEventRouter>;
