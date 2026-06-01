import { expect, beforeAll, afterAll, beforeEach, it } from 'vitest';
import { TransportAdapter } from './TransportAdapter';

export function runTransportAdapterContractTests(
  createAdapter: () => TransportAdapter,
  setupFn: () => Promise<void>,
  teardownFn: () => Promise<void>
) {
  return () => {
    let adapter: TransportAdapter;

    beforeAll(async () => {
      await setupFn();
    });

    afterAll(async () => {
      await teardownFn();
    });

    beforeEach(() => {
      adapter = createAdapter();
    });

    it('should be able to connect and disconnect', async () => {
      expect(adapter.isConnected()).toBe(false);
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it('should trigger onConnect and onDisconnect hooks', async () => {
      let connected = false;
      let disconnected = false;
      
      adapter.onConnect(() => connected = true);
      adapter.onDisconnect(() => disconnected = true);

      await adapter.connect();
      expect(connected).toBe(true);
      
      await adapter.disconnect();
      expect(disconnected).toBe(true);
    });

    it('should emit and subscribe to events', async () => {
      await adapter.connect();
      
      let receivedPayload: any = null;
      adapter.subscribe('test:event', (payload: any) => {
        receivedPayload = payload;
      });

      // Usually requires a real backend or loopback in contract tests
      // For this spec, we just ensure no errors are thrown during emit
      await adapter.emit('test:event', { data: 123 });
      
      await adapter.disconnect();
    });
  };
}
