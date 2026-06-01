import React, { ReactNode } from 'react';

export function ChatRoom({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}
