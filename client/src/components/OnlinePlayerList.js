import React from 'react';

const statusMap = { idle: '空闲', playing: '游戏中', away: '离开' };
const statusClass = { idle: 'status-idle', playing: 'status-playing', away: 'status-away' };

export default function OnlinePlayerList({ players, currentUserId }) {
  return (
    <div className="side-panel">
      <h3>🌐 在线玩家 ({players.length})</h3>
      <ul className="player-list">
        {players.map(p => (
          <li key={p._id} className="player-item">
            <span className="player-name">{p.username}{p._id === currentUserId ? ' (我)' : ''}</span>
            <span className={'player-status ' + (statusClass[p.status] || '')}>{statusMap[p.status] || p.status}</span>
          </li>
        ))}
        {players.length === 0 && <li style={{color:'#999', padding:'20px 0', textAlign:'center'}}>暂无在线玩家</li>}
      </ul>
    </div>
  );
}