import React from 'react';

export function TypingIndicator({ users, className = '' }: { users: string[], className?: string }) {
  if (users.length === 0) return null;
  
  const text = users.length === 1 
    ? `${users[0]} is typing...` 
    : `${users.length} people are typing...`;
    
  return (
    <div className={`text-xs text-gray-500 italic px-4 py-1 ${className}`} aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}
