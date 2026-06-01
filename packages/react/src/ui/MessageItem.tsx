import React from 'react';
import type { Message } from '@realtimejs/core';
import { UserAvatar } from './UserAvatar';

export interface MessageItemProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
}

export function MessageItem({ message, onEdit, onDelete, onReact }: MessageItemProps) {
  return (
    <div 
      className="rt-message-item"
      role="article"
      aria-label={`Message from ${message.userId}`}
    >
      <UserAvatar userId={message.userId} />
      <div className="rt-message-content">
        <span className="rt-message-sender" aria-hidden="true">{message.userId}</span>
        <p>{message.isDeleted ? <em>Message deleted</em> : message.content}</p>
        
        {message.reactions && Object.entries(message.reactions).map(([emoji, users]) => (
          <button 
            key={emoji}
            onClick={() => onReact?.(message.id, emoji)}
            aria-label={`${users.length} reactions of ${emoji}`}
          >
            {emoji} {users.length}
          </button>
        ))}
      </div>
    </div>
  );
}
