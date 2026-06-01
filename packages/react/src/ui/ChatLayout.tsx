import React, { ReactNode } from 'react';

export interface ChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  infoPane?: ReactNode;
  showSidebarOnMobile?: boolean;
}

export function ChatLayout({ sidebar, children, infoPane, showSidebarOnMobile = true }: ChatLayoutProps) {
  return (
    <div className="flex w-full h-full bg-[#111B21] text-[#E9EDEF] overflow-hidden relative">
      <div className={`w-full md:w-[30%] md:min-w-[350px] md:max-w-[450px] border-r border-white/10 flex-col ${showSidebarOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {sidebar}
      </div>
      <div className={`flex-1 flex-col bg-[#222E35] ${showSidebarOnMobile ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </div>
      {infoPane && (
        <div className={`w-full md:w-[350px] border-l border-white/10 flex-col bg-[#111B21] absolute md:relative right-0 top-0 h-full z-20 animate-in slide-in-from-right duration-200 flex`}>
          {infoPane}
        </div>
      )}
    </div>
  );
}
