import React from 'react';
import { Search, MoreVertical, MessageSquare } from 'lucide-react';

export interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: number;
  unreadCount?: number;
  avatarUrl?: string;
}

export interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  currentUserAvatarUrl?: string;
  onNewChat?: () => void;
  onMenuClick?: () => void;
}

export function Sidebar({ 
  conversations, 
  activeConversationId, 
  onSelectConversation,
  currentUserAvatarUrl,
  onNewChat,
  onMenuClick
}: SidebarProps) {
  
  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[#111B21]">
      {/* Header */}
      <div className="h-[60px] bg-[#202C33] flex items-center justify-between px-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-[#6b7c85] overflow-hidden cursor-pointer shadow-sm">
          {currentUserAvatarUrl ? <img src={currentUserAvatarUrl} alt="Me" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">ME</div>}
        </div>
        <div className="flex items-center gap-4 text-[#AEC1CC]">
          <button onClick={onNewChat} className="hover:text-[#E9EDEF] transition-colors"><MessageSquare size={20} strokeWidth={1.5} /></button>
          <button onClick={onMenuClick} className="hover:text-[#E9EDEF] transition-colors"><MoreVertical size={20} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-[#111B21] border-b border-white/5">
        <div className="bg-[#202C33] rounded-lg flex items-center px-3 py-1.5 gap-3">
          <Search size={18} className="text-[#8696A0]" strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none outline-none text-[#E9EDEF] text-sm w-full placeholder-[#8696A0]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv, index) => {
          const isActive = conv.id === activeConversationId;
          return (
            <div 
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`flex items-center pl-3 cursor-pointer hover:bg-[#202C33] transition-colors ${isActive ? 'bg-[#2A3942] hover:bg-[#2A3942]' : ''}`}
            >
              <div className="w-[48px] h-[48px] rounded-full flex-shrink-0 bg-slate-600 overflow-hidden shadow-sm mr-3">
                {conv.avatarUrl ? <img src={conv.avatarUrl} alt={conv.name} /> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">{conv.name.charAt(0).toUpperCase()}</div>}
              </div>
              <div className={`flex-1 min-w-0 py-3 pr-3 ${index !== conversations.length - 1 && !isActive ? 'border-b border-white/5' : ''}`}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[#E9EDEF] text-[17px] truncate leading-tight">{conv.name}</span>
                  <span className={`text-[12px] ${conv.unreadCount ? 'text-[#00A884]' : 'text-[#8696A0]'}`}>{formatTime(conv.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[14px] truncate ${conv.unreadCount ? 'text-[#E9EDEF] font-medium' : 'text-[#8696A0]'}`}>{conv.lastMessage || '...'}</span>
                  {conv.unreadCount && conv.unreadCount > 0 && (
                    <span className="bg-[#00A884] text-[#111B21] text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-2">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
