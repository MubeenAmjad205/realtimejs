import React from 'react';
import { createRealtime } from '@realtimejs/core';
import { socketioAdapter } from '@realtimejs/adapter-socketio';
import { RealtimeProvider, useChat, useTyping } from '@realtimejs/react';
import { ChatRoom, MessageList, MessageInput, TypingIndicator } from '@realtimejs/react';

// Connect to a local server. If not running, it gracefully fails and keeps UI working optimistically!
const realtimeClient = createRealtime({
  transport: socketioAdapter({ url: 'http://localhost:3000' })
});

function ChatApp() {
  const ROOM_ID = 'demo-room';
  const USER_ID = 'user-' + Math.floor(Math.random() * 1000);

  const { messages, sendMessage } = useChat(ROOM_ID, USER_ID);
  const { typingUsers, startTyping, stopTyping } = useTyping(ROOM_ID, USER_ID);

  return (
    <div className="max-w-xl mx-auto py-10 h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">RealtimeJS Playground</h2>
      <ChatRoom className="h-[600px]">
        <MessageList messages={messages} currentUserId={USER_ID} />
        <TypingIndicator users={typingUsers} />
        <MessageInput 
          onSend={sendMessage} 
          onTyping={(isTyping) => isTyping ? startTyping() : stopTyping()} 
        />
      </ChatRoom>
    </div>
  );
}

export function App() {
  return (
    <RealtimeProvider client={realtimeClient}>
      <ChatApp />
    </RealtimeProvider>
  );
}
