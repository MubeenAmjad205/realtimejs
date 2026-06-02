// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat, usePresence, useRoom, RealtimeProvider } from './index';

const mockClient = {
  chat: {
    sendMessage: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    toggleReaction: vi.fn(),
    getMessages: vi.fn().mockResolvedValue([]),
    onMessage: vi.fn(() => () => {}),
    onMessageEdited: vi.fn(() => () => {}),
    onMessageDeleted: vi.fn(() => () => {}),
    onReactionChanged: vi.fn(() => () => {}),
  },
  presence: {
    setStatus: vi.fn(),
    onPresenceUpdate: vi.fn(() => () => {}),
  },
  typing: {
    startTyping: vi.fn(),
    stopTyping: vi.fn(),
    onTypingChange: vi.fn(() => () => {}),
  },
  rooms: {
    join: vi.fn().mockResolvedValue(undefined),
    leave: vi.fn().mockResolvedValue(undefined),
  },
  connection: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  }
} as unknown as RealtimeInstance;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RealtimeProvider client={mockClient}>{children}</RealtimeProvider>
);

describe('React Hooks', () => {
  it('useChat should initialize and return methods', () => {
    const { result } = renderHook(() => useChat('room1', 'user1'), { wrapper });
    expect(result.current.messages).toEqual([]);
    expect(result.current.sendMessage).toBeDefined();
  });

  it('usePresence should return presence map', () => {
    const { result } = renderHook(() => usePresence(), { wrapper });
    expect(result.current.presenceMap).toEqual({});
  });

  it('useRoom should call join', async () => {
    const { result } = renderHook(() => useRoom('room1'), { wrapper });
    await act(async () => {
      await result.current.join({ meta: 'data' });
    });
    expect(mockClient.rooms.join).toHaveBeenCalledWith('room1', { meta: 'data' });
  });
});
