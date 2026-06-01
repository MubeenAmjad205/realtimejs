import React from 'react';

export interface UserAvatarProps {
  userId: string;
  avatarUrl?: string;
  name?: string;
}

export function UserAvatar({ userId, avatarUrl, name }: UserAvatarProps) {
  return (
    <div 
      className="rt-avatar" 
      role="img" 
      aria-label={`Avatar for ${name || userId}`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${name || userId}'s avatar`} />
      ) : (
        <span>{(name || userId).substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
