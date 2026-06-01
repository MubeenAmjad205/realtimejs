import React, { useRef, useEffect } from 'react';
import type { Message } from '@realtimejs/core';
import { Pencil, Trash2, Reply } from 'lucide-react';
import { useUIConfig } from '../config/ConfigProvider';

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  onMarkRead?: (messageId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  reactionEmojis?: string[];
}

export function MessageList({ messages, currentUserId, className = '', onReact, onReply, onEdit, onDelete, onRetry, onMarkRead, onLoadMore, hasMore, reactionEmojis }: MessageListProps) {
  const { ui, features } = useUIConfig();
  const EMOJIS = reactionEmojis || ui.DEFAULT_REACTION_EMOJIS;
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Intersection Observer for marking messages as read
  useEffect(() => {
    if (!onMarkRead) return;
    
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) {
            onMarkRead(messageId);
            observer.current?.unobserve(entry.target);
          }
        }
      });
    }, { threshold: ui.READ_RECEIPT_THRESHOLD });

    return () => {
      observer.current?.disconnect();
    };
  }, [onMarkRead, ui.READ_RECEIPT_THRESHOLD]);

  // Helper ref callback to attach observer to unread incoming messages
  const observeMessage = (el: HTMLDivElement | null, msg: Message, isMe: boolean) => {
    if (el && !isMe && msg.status !== 'read' && onMarkRead && observer.current) {
      observer.current.observe(el);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], ui.TIME_FORMAT);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-2 flex flex-col bg-[#0B141A] ${className}`} role="log" aria-live="polite" aria-label="Message list">
      
      {/* Pagination Load More Button */}
      {features.ENABLE_PAGINATION && onLoadMore && hasMore && (
        <div className="flex justify-center my-2">
          <button 
            onClick={onLoadMore}
            className="bg-[#202C33] hover:bg-[#2A3942] text-[#8696A0] text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-white/5 shadow-sm"
          >
            Load older messages
          </button>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[#8696A0] italic text-sm">
          {ui.EMPTY_STATE_MESSAGE}
        </div>
      )}
      {messages.map((msg, index) => {
        const isMe = msg.userId === currentUserId;
        const parentMsg = msg.threadId ? messages.find(m => m.id === msg.threadId) : null;
        
        // Determine if we should show the tail
        const isPreviousMe = index > 0 && messages[index - 1].userId === msg.userId;
        const hasTails = !isPreviousMe;

        return (
          <div 
            key={msg.id} 
            data-message-id={msg.id}
            ref={(el) => observeMessage(el, msg, isMe)}
            className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} ${hasTails ? 'mt-2' : 'mt-[2px]'}`}
          >
            
            <div className={`relative max-w-[85%] md:max-w-[65%] rounded-lg shadow-sm
              ${isMe ? 'bg-[#005C4B] rounded-tr-none text-[#E9EDEF]' : 'bg-[#202C33] rounded-tl-none text-[#E9EDEF]'}
            `}>
              
              {/* Tails SVG */}
              {hasTails && isMe && (
                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-2 text-[#005C4B] fill-current">
                  <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                </svg>
              )}
              {hasTails && !isMe && (
                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-2 text-[#202C33] fill-current">
                  <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" transform="scale(-1, 1) translate(-8, 0)"></path>
                </svg>
              )}

              <div className="p-1 pb-2 min-w-[100px]">
                {/* Replying to Context */}
                {features.ENABLE_REPLIES && parentMsg && (
                  <div className="mx-1 mt-1 mb-1 bg-black/20 rounded border-l-4 border-[#00A884] p-2 flex flex-col cursor-pointer hover:bg-black/30 transition-colors">
                    <span className="text-[#00A884] font-medium text-xs">{parentMsg.userId}</span>
                    <span className="text-[#E9EDEF] opacity-80 text-xs truncate max-w-xs">{parentMsg.content}</span>
                  </div>
                )}

                {/* Attachments */}
                {features.ENABLE_FILE_ATTACHMENTS && msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-col gap-1 p-1">
                    {msg.attachments.map(att => (
                      att.type === 'image' || att.type.startsWith('image')
                        ? <img key={att.id} src={att.url} alt="Attachment" className="max-w-full max-h-[300px] rounded-lg object-cover cursor-pointer" onClick={() => window.open(att.url, '_blank')} />
                        : <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/20 p-3 rounded-lg text-sm text-[#E9EDEF] hover:bg-black/30">
                            <div className="w-10 h-10 flex items-center justify-center bg-[#202C33] rounded text-[#8696A0]"><span className="text-xl">📄</span></div>
                            <span className="truncate flex-1 text-[#53bdeb]">Document File</span>
                          </a>
                    ))}
                  </div>
                )}

                {/* Content and Inline Time */}
                <div className="px-2 pt-1 pb-1 relative">
                  <span className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words inline-block">{msg.content}</span>
                  
                  {/* Invisible padding to force text wrap around the timestamp block */}
                  <span className="inline-block w-[74px] h-[10px]"></span>
                  
                  {/* Inline Timestamp */}
                  <div className="absolute bottom-[-2px] right-2 flex items-center gap-1 text-[11px] text-[#8696A0]">
                    <span>{formatTime(msg.createdAt)}</span>
                    {features.ENABLE_READ_RECEIPTS && isMe && (
                      <svg viewBox="0 0 16 15" width="16" height="15" className={`${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696A0]'} fill-current`}>
                        {msg.status === 'sending' ? (
                          <path d="M9.75 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /> 
                        ) : msg.status === 'sent' ? (
                          <path d="M10.91 3.316l-.478-.372a.365.365 0 00-.51.063L4.566 9.879l-2.062-1.93a.359.359 0 00-.505.018l-.408.432a.36.36 0 00.02.518l2.76 2.584c.145.136.37.126.502-.022l5.962-7.653a.363.363 0 00-.063-.51z" /> 
                        ) : msg.status === 'failed' ? (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /> 
                        ) : (
                          <path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879l-2.062-1.93a.359.359 0 00-.505.018l-.408.432a.36.36 0 00.02.518l2.76 2.584c.145.136.37.126.502-.022l5.962-7.653a.363.363 0 00-.063-.51z M10.46 9.879L5.102 3.013a.365.365 0 00-.51-.063l-.478.372a.363.363 0 00-.063.51l5.738 7.37c.145.136.37.126.502-.022l.462-.594c.14-.18-.008-.444-.223-.464l-.07-.006z" /> 
                        )}
                      </svg>
                    )}
                    {isMe && msg.status === 'failed' && onRetry && (
                      <button onClick={() => onRetry(msg.id)} className="text-red-400 hover:text-red-300 ml-1 font-bold text-[10px] uppercase bg-black/20 px-1 rounded">Retry</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reactions Pill (Overlapping) */}
              {features.ENABLE_REACTIONS && msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className={`absolute -bottom-3 ${isMe ? 'right-0' : 'left-0'} flex gap-0.5 bg-[#202C33] border border-[#111B21] rounded-full px-1.5 py-0.5 shadow-sm z-10 scale-95`}>
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <button 
                      key={emoji} 
                      onClick={() => onReact?.(msg.id, emoji)}
                      className="flex items-center text-sm"
                    >
                      <span>{emoji}</span>
                      {users.length > 1 && <span className="text-[#8696A0] text-[10px] ml-1">{users.length}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Menu (Hover) - Moved under the bubble as requested */}
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex bg-[#202C33] rounded-full border border-white/10 shadow-lg absolute -bottom-10 ${isMe ? 'right-0' : 'left-0'} z-50`}>
                {features.ENABLE_MESSAGE_DELETION && isMe && onDelete && (
                  <button onClick={() => onDelete(msg.id)} className="p-1.5 hover:bg-white/10 text-[#8696A0] hover:text-red-400 rounded-l-full" title="Delete"><Trash2 size={16}/></button>
                )}
                {features.ENABLE_MESSAGE_EDITING && isMe && onEdit && (
                  <button onClick={() => onEdit(msg.id)} className="p-1.5 hover:bg-white/10 text-[#8696A0] hover:text-[#E9EDEF]" title="Edit"><Pencil size={16}/></button>
                )}
                {features.ENABLE_REPLIES && onReply && (
                   <button onClick={() => onReply(msg.id)} className="p-1.5 hover:bg-white/10 text-[#8696A0] hover:text-[#E9EDEF]" title="Reply"><Reply size={16}/></button>
                )}
                {features.ENABLE_REACTIONS && (
                  <div className="flex bg-[#202C33] border-l border-white/10 pl-1 pr-2 rounded-r-full items-center">
                    {onReact && EMOJIS.map(e => (
                      <button key={e} onClick={() => onReact(msg.id, e)} className="p-1 hover:bg-white/10 text-lg transition-transform hover:scale-110">{e}</button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
