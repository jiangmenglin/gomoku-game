import React from 'react';

export default function PlayerInfo({ player, color, isFriend, onAddFriend, isMe }) {
  if (!player) return null;
  const total = (player.wins || 0) + (player.losses || 0) + (player.draws || 0);
  const winRate = total > 0 ? ((player.wins / total) * 100).toFixed(1) : '0.0';
  const colorLabel = color === 'black' ? '⚫ 黑棋' : '⚪ 白棋';

  return (
    <div className="panel-info">
      <div className="info-row"><span className="label">👤 姓名</span><span className="value">{player.username}{isMe ? ' (我)' : ''}</span></div>
      <div className="info-row"><span className="label">🎲棋子</span><span className="value">{colorLabel}</span></div>
      <div className="info-row"><span className="label">🏆 胜场</span><span className="value">{player.wins || 0}</span></div>
      <div className="info-row"><span className="label">❌ 负场</span><span className="value">{player.losses || 0}</span></div>
      <div className="info-row"><span className="label">🤝 平局</span><span className="value">{player.draws || 0}</span></div>
      <div className="info-row"><span className="label">📊 胜率</span><span className="value">{winRate}%</span></div>
      {!isMe && (
        isFriend
          ? <div className="friend-status">✅ 已是好友</div>
          : <button className="btn btn-success btn-small friend-btn" onClick={onAddFriend}>➕ 加为好友</button>
      )}
    </div>
  );
}