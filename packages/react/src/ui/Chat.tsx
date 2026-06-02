import React, { useState } from 'react';
import { ChatRoom } from './ChatRoom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChatContext, ChatProvider } from '../index';
import { useUIConfig, UIConfigProvider } from '../config/ConfigProvider';
import { Modal } from './Modal';

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
  return (
    <ChatProvider roomId={roomId} userId={userId}>
      <ChatInner components={components} />
    </ChatProvider>
  );
}

function ChatInner({ components = {} }: { components?: ChatComponents }) {
  const { messages, sendMessage, toggleReaction, editMessage, deleteMessage, markRead, retry, loadHistory, userId, typingUsers, startTyping, stopTyping } = useChatContext();
  const { ui, features } = useUIConfig();

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const replyingToMessage = messages.find(m => m.id === replyingToId) || null;

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  const handleLoadMore = async () => {
    if (messages.length === 0) return;
    const oldestMsg = messages[0];
    const history = await loadHistory(ui.PAGINATION_LIMIT, oldestMsg.id);
    if (history.length < ui.PAGINATION_LIMIT) {
      setHasMore(false);
    }
  };

  const List = components.MessageList || MessageList;
  const Input = components.MessageInput || MessageInput;
  const Indicator = components.TypingIndicator || TypingIndicator;

  return (
    <div className="rt-chat-wrapper" role="region" aria-label="Chat Interface">
      <ChatRoom>
        <List 
          messages={messages} 
          currentUserId={userId} 
          onReact={toggleReaction}
          onReply={(id) => setReplyingToId(id)}
          onEdit={(id) => {
            const msg = messages.find(m => m.id === id);
            if (msg) {
              setEditInputValue(msg.content);
              setEditingMessageId(id);
            }
          }}
          onDelete={(id) => setDeletingMessageId(id)}
          onRetry={retry}
          onMarkRead={markRead}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
        {features.ENABLE_TYPING_INDICATORS && <Indicator users={typingUsers} />}
        <Input 
          onSend={(text, threadId, attachments) => sendMessage(text, threadId, attachments)} 
          onTyping={(isTyping: boolean) => isTyping ? startTyping() : stopTyping()} 
          replyingTo={replyingToMessage}
          onCancelReply={() => setReplyingToId(null)}
        />
      </ChatRoom>

      {/* Edit Message Modal */}
      <Modal 
        isOpen={!!editingMessageId} 
        onClose={() => setEditingMessageId(null)}
        title="Edit Message"
        actions={
          <>
            <button 
              onClick={() => setEditingMessageId(null)}
              className="text-[#00A884] hover:bg-white/5 px-6 py-2 rounded font-medium transition-colors border border-transparent hover:border-white/10"
            >
              CANCEL
            </button>
            <button 
              onClick={() => {
                if (editingMessageId && editInputValue.trim()) {
                  editMessage(editingMessageId, editInputValue.trim());
                  setEditingMessageId(null);
                }
              }}
              className="bg-[#00A884] text-[#111B21] hover:bg-[#00C298] px-6 py-2 rounded font-medium shadow-sm transition-colors"
            >
              SAVE
            </button>
          </>
        }
      >
        <input 
          type="text" 
          value={editInputValue} 
          onChange={(e) => setEditInputValue(e.target.value)} 
          className="w-full bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded border border-transparent focus:border-[#00A884] outline-none transition-colors"
          autoFocus
        />
      </Modal>

      {/* Delete Message Modal */}
      <Modal 
        isOpen={!!deletingMessageId} 
        onClose={() => setDeletingMessageId(null)}
        title={ui.DELETE_CONFIRM_MESSAGE}
        actions={
          <>
            <button 
              onClick={() => setDeletingMessageId(null)}
              className="text-[#00A884] hover:bg-white/5 px-6 py-2 rounded font-medium transition-colors border border-transparent hover:border-white/10"
            >
              CANCEL
            </button>
            <button 
              onClick={() => {
                if (deletingMessageId) {
                  deleteMessage(deletingMessageId);
                  setDeletingMessageId(null);
                }
              }}
              className="bg-[#00A884] text-[#111B21] hover:bg-[#00C298] px-6 py-2 rounded font-medium shadow-sm transition-colors"
            >
              DELETE
            </button>
          </>
        }
      >
        <p className="text-[#8696A0]">This message will be deleted for everyone in this chat.</p>
      </Modal>
    </div>
  );
}
