import { EventRouter } from '../../runtime/EventRouter';
import { AdapterRegistry } from '../../core/config/registry/AdapterRegistry';
import { getCurrentTimestamp } from '../../shared/utils';

export function createRoomManager(eventRouter: EventRouter, registry: AdapterRegistry) {
  const rooms = new Set<string>();
  const db = registry.getDatabase();

  return {
    join: async (roomId: string, metadata?: Record<string, unknown>) => {
      await eventRouter.emit('room:join', { roomId });
      rooms.add(roomId);
      
      if (db) {
        try {
          await db.update('rooms', roomId, { ...(metadata || {}), lastActivity: getCurrentTimestamp() });
        } catch {
          await db.create('rooms', { id: roomId, ...(metadata || {}), lastActivity: getCurrentTimestamp() });
        }
      }
    },
    leave: async (roomId: string) => {
      await eventRouter.emit('room:leave', { roomId });
      rooms.delete(roomId);
    },
    getJoinedRooms: () => Array.from(rooms),
  };
}
