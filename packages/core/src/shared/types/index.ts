export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: number;
  editedAt?: number;
  isDeleted?: boolean;
  threadId?: string;
  reactions?: Record<string, string[]>;
  attachments?: Attachment[];
  status?: MessageStatus;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file';
  size: number;
}

export interface SessionState {
  sessionId: string | null;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  lastActive: number;
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface PresenceUpdate {
  userId: string;
  status: UserStatus;
  lastSeen: number;
}

export interface TypingEvent {
  roomId: string;
  userId: string;
  isTyping: boolean;
}
