import React, { useState } from 'react';
import { createRealtime } from '@realtimejs/core';
import { createFakeAdapter, createFakeStorage, createFakeDatabase } from './fakeAdapter';
import { RealtimeProvider, useChat, useTyping, usePresence, UIConfigProvider, useUIConfig } from '@realtimejs/react';
import { ChatRoom, MessageList, MessageInput, TypingIndicator, ChatLayout, Sidebar, Modal, GroupInfoPane } from '@realtimejs/react';

// Use a fake adapter so the playground works perfectly without needing a backend server!
const realtimeClient = createRealtime({
  transport: createFakeAdapter(),
  storage: createFakeStorage(),
  database: createFakeDatabase()
});

function ChatApp() {
  // Let the user switch rooms by clicking the sidebar
  const [activeRoomId, setActiveRoomId] = useState('demo-room');
  const USER_ID = 'user-' + Math.floor(Math.random() * 1000);

  const [conversations, setConversations] = useState([
    { id: 'demo-room', name: 'Engineering Group', unreadCount: 0, lastMessage: 'Looks good to me!', timestamp: Date.now() },
    { id: 'product-sync', name: 'Product Sync', unreadCount: 3, lastMessage: 'Are we launching today?', timestamp: Date.now() - 3600000 },
    { id: 'alice-dm', name: 'Alice (DM)', unreadCount: 1, lastMessage: 'Can you check the PR?', timestamp: Date.now() - 86400000 }
  ]);

  const { messages, sendMessage, toggleReaction, editMessage, deleteMessage, markRead, retry, loadHistory } = useChat(activeRoomId, USER_ID);
  const { typingUsers, startTyping, stopTyping } = useTyping(activeRoomId, USER_ID);
  const { presenceMap, setStatus } = usePresence();
  const { ui } = useUIConfig();
  
  // Track mobile view state
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  // Set ourselves as online on mount
  React.useEffect(() => {
    setStatus(USER_ID, 'online');
    return () => { setStatus(USER_ID, 'offline'); };
  }, [setStatus, USER_ID]);

  // Keep sidebar last message in sync with active room messages
  React.useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      setConversations(prev => prev.map(c => 
        c.id === activeRoomId 
          ? { ...c, lastMessage: lastMsg.content || 'Photo', timestamp: lastMsg.createdAt } 
          : c
      ));
    }
  }, [messages, activeRoomId]);
  
  // Check if anyone else in the room is online
  const otherUsersOnline = Object.values(presenceMap).some(p => p.userId !== USER_ID && p.status === 'online');

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const handleReply = (msgId: string) => {
    setReplyingToId(msgId);
  };
  
  const replyingToMessage = messages.find(m => m.id === replyingToId) || null;

  // UI States
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  const handleLoadMore = async () => {
    if (messages.length === 0) return;
    const oldestMsg = messages[0];
    const history = await loadHistory(20, oldestMsg.id);
    if (history.length < 20) {
      setHasMore(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-[#E9EDEF] p-0 md:p-4 relative w-full h-full">
      <div className="w-full h-full md:max-w-[1200px] md:h-[95vh] shadow-2xl flex overflow-hidden bg-[#111B21] md:border border-white/5 md:rounded-xl">
        <ChatLayout 
          showSidebarOnMobile={showSidebarOnMobile}
          infoPane={
            showGroupInfo ? (
              <GroupInfoPane 
                roomId={activeRoomId} 
                roomName={conversations.find(c => c.id === activeRoomId)?.name || activeRoomId} 
                totalMembers={Object.keys(presenceMap).length || 1} 
                onClose={() => setShowGroupInfo(false)} 
              />
            ) : undefined
          }
          sidebar={
            <Sidebar 
              conversations={conversations} 
              activeConversationId={activeRoomId} 
              onSelectConversation={(id) => {
                setActiveRoomId(id);
                setShowSidebarOnMobile(false);
              }} 
              onNewChat={() => setShowNewChat(true)}
              onMenuClick={() => setShowSettings(true)}
            />
          }
        >
          {/* Chat Header */}
          <header className="bg-[#202C33] p-3 flex items-center justify-between border-b border-white/5 h-[60px]">
            <div className="flex items-center gap-3">
              {/* Back Button for Mobile */}
              <button 
                className="md:hidden text-[#8696A0] hover:text-[#E9EDEF] mr-1" 
                onClick={() => setShowSidebarOnMobile(true)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
              </button>
              
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-lg text-white">
                {activeRoomId.charAt(0).toUpperCase()}
              </div>
              <div 
                className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => setShowGroupInfo(!showGroupInfo)}
                title="Click for group info"
              >
                <span className="font-medium text-[16px] leading-tight">{conversations.find(c => c.id === activeRoomId)?.name || activeRoomId}</span>
              <span className="text-[13px] text-[#8696A0]">
                {otherUsersOnline ? <span className="text-[#00A884]">{ui.HEADER_ONLINE}</span> : ui.HEADER_SUBTITLE}
              </span>
            </div>
          </div>
          <div className="flex gap-4 px-2 text-[#8696A0]">
             <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">ID: {USER_ID}</span>
          </div>
        </header>
        
        <ChatRoom className="flex-1 flex flex-col overflow-hidden relative">
          <MessageList 
            messages={messages} 
            currentUserId={USER_ID} 
            onReact={toggleReaction}
            onReply={handleReply}
            onRetry={retry}
            onMarkRead={markRead}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
          
          <div className="bg-[#202C33] px-4 py-2">
            <TypingIndicator users={typingUsers} />
            <MessageInput 
              onSend={(text, threadId, attachments) => sendMessage(text, threadId, attachments)} 
              onTyping={(isTyping) => isTyping ? startTyping() : stopTyping()} 
              replyingTo={replyingToMessage}
              onCancelReply={() => setReplyingToId(null)}
            />
          </div>
        </ChatRoom>
        </ChatLayout>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        title="Start New Chat"
        actions={
          <>
            <button onClick={() => setShowNewChat(false)} className="text-[#00A884] hover:bg-white/5 px-6 py-2 rounded font-medium transition-colors border border-transparent hover:border-white/10">CANCEL</button>
            <button 
              onClick={() => {
                if (newChatName.trim()) {
                  const id = newChatName.toLowerCase().replace(/\W+/g, '-');
                  setConversations([{ id, name: newChatName.trim(), unreadCount: 0, timestamp: Date.now() }, ...conversations]);
                  setActiveRoomId(id);
                  setShowSidebarOnMobile(false);
                  setShowNewChat(false);
                  setNewChatName('');
                }
              }} 
              className="bg-[#00A884] text-[#111B21] hover:bg-[#00C298] px-6 py-2 rounded font-medium shadow-sm transition-colors"
            >
              CREATE
            </button>
          </>
        }
      >
        <input 
          type="text" 
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="Enter chat name..."
          className="w-full bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded border border-transparent focus:border-[#00A884] outline-none transition-colors"
          autoFocus
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        actions={
          <button onClick={() => setShowSettings(false)} className="bg-[#00A884] text-[#111B21] hover:bg-[#00C298] px-6 py-2 rounded font-medium shadow-sm transition-colors">OK</button>
        }
      >
        <p className="text-[#8696A0]">Settings menu is coming soon! You will be able to customize your theme and notifications here.</p>
      </Modal>

    </div>
  );
}

export function App() {
  return (
    <RealtimeProvider client={realtimeClient}>
      <UIConfigProvider config={{
        features: {
          ENABLE_TYPING_INDICATORS: true,
          ENABLE_PRESENCE_INDICATORS: true,
          ENABLE_PAGINATION: true
        },
        ui: {
          PAGINATION_LIMIT: 20
        }
      }}>
        <ChatApp />
      </UIConfigProvider>
    </RealtimeProvider>
  );
}
