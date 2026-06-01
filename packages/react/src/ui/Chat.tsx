import React from 'react';
import { ChatRoom } from './ChatRoom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat, useTyping } from '../index';

export interface ChatComponents {
  MessageList?: typeof MessageList;
  MessageInput?: typeof MessageInput;
  TypingIndicator?: typeof TypingIndicator;
}

export interface ChatProps {
  roomId: string;
  userId: string;
  components?: ChatComponents;
}

export function Chat({ roomId, userId, components = {} }: ChatProps) {
  const { messages, sendMessage } = useChat(roomId, userId);
  const { typingUsers, startTyping, stopTyping } = useTyping(roomId, userId);

  const List = components.MessageList || MessageList;
  const Input = components.MessageInput || MessageInput;
  const Indicator = components.TypingIndicator || TypingIndicator;

  return (
    <div className="rt-chat-wrapper" role="region" aria-label="Chat Interface">
      <ChatRoom>
        <List messages={messages} currentUserId={userId} />
        <Indicator users={typingUsers} />
        <Input 
          onSend={(text: string) => sendMessage(text)} 
          onTyping={(isTyping: boolean) => isTyping ? startTyping() : stopTyping()} 
        />
      </ChatRoom>
    </div>
  );
}
