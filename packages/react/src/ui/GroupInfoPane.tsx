import React from 'react';

export interface GroupInfoPaneProps {
  roomId: string;
  roomName: string;
  totalMembers: number;
  onClose: () => void;
}

export function GroupInfoPane({ roomId, roomName, totalMembers, onClose }: GroupInfoPaneProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[#111B21]">
      <div className="h-[60px] bg-[#202C33] flex items-center px-4 border-b border-white/5 gap-4 shadow-sm">
        <button onClick={onClose} className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors">
          <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
        </button>
        <span className="text-[#E9EDEF] font-medium text-[16px]">Contact info</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-[#111B21] flex flex-col items-center py-8 shadow-sm mb-2">
          <div className="w-[200px] h-[200px] rounded-full bg-slate-600 mb-5 flex items-center justify-center text-white text-6xl font-bold overflow-hidden shadow-lg">
            {roomName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-[#E9EDEF] text-2xl mb-1">{roomName}</h2>
          <p className="text-[#8696A0] text-sm">Group · {totalMembers} participants</p>
        </div>

        <div className="bg-[#111B21] py-4 px-6 shadow-sm border-t border-white/5">
          <p className="text-[#8696A0] text-[14px] mb-2">About and phone number</p>
          <p className="text-[#E9EDEF] text-[16px]">Available</p>
        </div>
      </div>
    </div>
  );
}
