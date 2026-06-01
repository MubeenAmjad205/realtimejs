import React from 'react';
import { ChatRoom } from './ChatRoom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat, useTyping } from '../index';

export interface ChatProps {
  roomId: string;
  userId: string;
}

export function Chat({ roomId, userId }: ChatProps) {
  const { messages, sendMessage } = useChat(roomId, userId);
  const { typingUsers, startTyping, stopTyping } = useTyping(roomId, userId);

  return (
    <div className="rt-chat-wrapper" role="region" aria-label="Chat Interface">
      <ChatRoom>
        <MessageList messages={messages} currentUserId={userId} />
        <TypingIndicator users={typingUsers} />
        <MessageInput 
          onSend={(text) => sendMessage(text)} 
          onTyping={(isTyping) => isTyping ? startTyping() : stopTyping()} 
        />
      </ChatRoom>
    </div>
  );
}
