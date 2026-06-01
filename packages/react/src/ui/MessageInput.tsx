import React, { useState, KeyboardEvent } from 'react';

export function MessageInput({ onSend, onTyping, className = '' }: { onSend: (text: string) => void, onTyping?: (isTyping: boolean) => void, className?: string }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      if (onTyping) onTyping(false);
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

  return (
    <div className={`p-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2 ${className}`}>
      <input 
        type="text" 
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        aria-label="Type a message"
        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        onClick={handleSend}
        aria-label="Send message"
        className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
