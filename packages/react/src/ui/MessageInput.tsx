import React, { useState, KeyboardEvent, useRef, useEffect, ChangeEvent } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Paperclip, X, Smile } from 'lucide-react';
import { useUIConfig } from '../config/ConfigProvider';

export interface MessageInputProps {
  onSend: (text: string, threadId?: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  className?: string;
  replyingTo?: { id: string; content: string } | null;
  onCancelReply?: () => void;
  emojiOptions?: string[];
}

export function MessageInput({ onSend, onTyping, className = '', replyingTo, onCancelReply }: MessageInputProps) {
  const { features, ui } = useUIConfig();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertEmoji = (emojiData: any) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleSend = () => {
    if (text.trim() || attachments.length > 0) {
      onSend(text.trim(), replyingTo?.id, attachments);
      setText('');
      setAttachments([]);
      if (onTyping) onTyping(false);
      if (onCancelReply) onCancelReply();
      setShowEmoji(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (onTyping) {
      if (e.target.value.length > 0) onTyping(true);
      else onTyping(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`flex flex-col relative w-full bg-[#202C33] ${className}`}>
      {features.ENABLE_REPLIES && replyingTo && (
        <div className="bg-[#202C33] p-2 flex justify-between items-center w-full">
          <div className="flex-1 bg-[#2A3942] rounded-lg border-l-4 border-[#00A884] p-2 flex flex-col justify-center min-h-[46px] ml-14 mr-4">
            <span className="text-[#00A884] font-medium text-[13px] leading-tight">Replying to {replyingTo.id}</span>
            <span className="text-[#8696A0] text-[13px] truncate">{replyingTo.content}</span>
          </div>
          <button onClick={onCancelReply} className="text-[#8696A0] hover:text-[#E9EDEF] p-2 mr-2">
            <X size={24} strokeWidth={1.5}/>
          </button>
        </div>
      )}

      {features.ENABLE_FILE_ATTACHMENTS && attachments.length > 0 && (
        <div className="flex gap-3 px-4 py-3 flex-wrap border-t border-white/5 bg-[#202C33]">
          {attachments.slice(0, ui.ATTACHMENT_PREVIEW_LIMIT).map((file, i) => (
            <div key={i} className="relative bg-[#2A3942] rounded-lg border border-white/5 p-2 flex items-center gap-3 group shadow-sm">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-[#202C33] rounded text-[#8696A0]"><Paperclip size={20}/></div>
              )}
              <div className="text-sm text-[#E9EDEF] max-w-[150px] truncate">{file.name}</div>
              <button onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 bg-[#3B4A54] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#E9EDEF] shadow-md border border-white/10 hover:bg-[#8696A0]"><X size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-16 left-0 z-50 animate-slide-up shadow-2xl">
          <EmojiPicker 
            theme={Theme.DARK} 
            onEmojiClick={insertEmoji}
            lazyLoadEmojis={true}
            searchDisabled
            skinTonesDisabled
          />
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-2 min-h-[62px]">
        <div className="flex items-center gap-2">
          {features.ENABLE_REACTIONS && (
            <button onClick={() => setShowEmoji(!showEmoji)} className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors p-2 rounded-full">
              <Smile size={26} strokeWidth={1.5}/>
            </button>
          )}
          {features.ENABLE_FILE_ATTACHMENTS && (
            <button onClick={() => fileInputRef.current?.click()} className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors p-2 rounded-full">
              <Paperclip size={24} strokeWidth={1.5}/>
            </button>
          )}
        </div>
        {features.ENABLE_FILE_ATTACHMENTS && <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />}
        
        <input 
          ref={inputRef}
          type="text" 
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          aria-label="Type a message"
          className="flex-1 px-4 py-2.5 bg-[#2A3942] rounded-lg focus:outline-none text-[#E9EDEF] placeholder-[#8696A0] text-[15px]"
        />
        
        <button 
          onClick={handleSend}
          aria-label="Send message"
          disabled={!text.trim() && attachments.length === 0}
          className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors disabled:opacity-50 disabled:hover:text-[#8696A0] p-2 rounded-full flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="fill-current"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
        </button>
      </div>
    </div>
  );
}
