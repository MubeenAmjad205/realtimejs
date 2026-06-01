import { io } from 'socket.io-client';
export function socketioAdapter(config) {
    let socket = null;
    // Store listeners so they can be reattached if the socket reconnects or is recreated
    const eventListeners = new Map();
    return {
        connect: () => {
            return new Promise((resolve, reject) => {
                if (socket && socket.connected) {
                    return resolve();
                }
                socket = io(config.url, {
                    autoConnect: true,
                    ...config.options,
                });
                socket.once('connect', () => {
                    resolve();
                });
                socket.once('connect_error', (err) => {
                    reject(err);
                });
                // Re-attach persistent listeners for user-defined events
                eventListeners.forEach((listeners, event) => {
                    listeners.forEach((callback) => {
                        socket?.on(event, callback);
                    });
                });
            });
        },
        disconnect: async () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        },
        emit: async (event, payload) => {
            if (!socket || !socket.connected) {
                throw new Error('Socket.IO is not connected. Call connect() first.');
            }
            socket.emit(event, payload);
        },
        subscribe: (event, callback) => {
            if (!eventListeners.has(event)) {
                eventListeners.set(event, new Set());
            }
            eventListeners.get(event).add(callback);
            if (socket) {
                socket.on(event, callback);
            }
        },
        unsubscribe: (event) => {
            eventListeners.delete(event);
            if (socket) {
                socket.off(event);
            }
        },
        isConnected: () => {
            return socket ? socket.connected : false;
        },
        onConnect: (callback) => {
            socket?.on('connect', callback);
        },
        onDisconnect: (callback) => {
            socket?.on('disconnect', callback);
        },
        onError: (callback) => {
            socket?.on('connect_error', callback);
            socket?.on('error', callback);
        },
    };
}
//# sourceMappingURL=index.js.map