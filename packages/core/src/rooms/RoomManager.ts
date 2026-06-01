import { EventRouter } from '../runtime/EventRouter';

export function createRoomManager(eventRouter: EventRouter) {
  const rooms = new Set<string>();

  return {
    join: async (roomId: string) => {
      await eventRouter.emit('room:join', { roomId });
      rooms.add(roomId);
    },
    leave: async (roomId: string) => {
      await eventRouter.emit('room:leave', { roomId });
      rooms.delete(roomId);
    },
    getJoinedRooms: () => Array.from(rooms),
  };
}
