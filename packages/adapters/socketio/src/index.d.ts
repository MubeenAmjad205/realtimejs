import type { TransportAdapter } from '@realtimejs/core';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
export interface SocketIOAdapterConfig {
    url: string;
    options?: Partial<ManagerOptions & SocketOptions>;
}
export declare function socketioAdapter(config: SocketIOAdapterConfig): TransportAdapter;
//# sourceMappingURL=index.d.ts.map