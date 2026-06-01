import React from 'react';
import { usePresence } from '../index';
import { UserAvatar } from './UserAvatar';

export function OnlineUsers() {
  const { presenceMap } = usePresence();
  const onlineUsers = Object.values(presenceMap).filter(p => p.status === 'online');

  return (
    <div 
      className="rt-online-users"
      role="complementary"
      aria-label="Online users"
    >
      <h3 id="online-users-heading">Online Users ({onlineUsers.length})</h3>
      <ul aria-labelledby="online-users-heading">
        {onlineUsers.map(user => (
          <li key={user.userId} className="rt-online-user-item">
            <UserAvatar userId={user.userId} />
            <span aria-label={`${user.userId} is online`}>{user.userId}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
