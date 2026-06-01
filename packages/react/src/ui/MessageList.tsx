import React from 'react';
import type { Message } from '@realtimejs/core';

export function MessageList({ messages, currentUserId, className = '' }: { messages: Message[], currentUserId: string, className?: string }) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}>
      {messages.map((msg) => {
        const isMe = msg.userId === currentUserId;
        return (
          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400 mb-1">{msg.userId}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[75%] ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
