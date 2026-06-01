import React, { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200">
      <div 
        className="bg-[#3B4A54] w-[90%] max-w-[400px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <h2 className="text-[#E9EDEF] text-[19px] mb-4">{title}</h2>
          <div className="text-[#E9EDEF] text-[15px]">
            {children}
          </div>
        </div>
        
        {actions && (
          <div className="px-6 py-4 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
