import React, { ReactNode } from 'react';

export function ChatRoom({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col relative ${className}`}>
      {children}
    </div>
  );
}
