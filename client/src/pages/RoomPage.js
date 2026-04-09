import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import OnlinePlayerList from '../components/OnlinePlayerList';

export default function RoomPage() {
  const { token, user, logout, refreshUser } = useAuth();
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
    const socket = connectSocket(token);

    socket.on('onlineUsers', (users) => {
      setOnlinePlayers(users);
    });

    socket.on('gameStart', () => {
      navigate('/game');
    });

    return () => {};// eslint-disable-next-line
  }, [token]);

  const handleStartGame = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('startMatching');
      navigate('/game');
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const total = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = total > 0 ? ((user.wins / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="room-page">
      <div className="room-header">
        <h1>🎮 五子棋大厅</h1>
        <div className="user-info">
          <span>👤 {user?.username}</span>
          <button className="btn btn-danger btn-small" onClick={handleLogout}>退出登录</button>
        </div>
      </div>
      <div className="room-content">
        <div className="main-panel">
          <h2>欢迎回来，{user?.username}！</h2>
          <div className="stats">
            <div className="stat-item"><div className="stat-value">{user?.wins || 0}</div><div className="stat-label">胜场</div></div>
            <div className="stat-item"><div className="stat-value">{user?.losses || 0}</div><div className="stat-label">负场</div></div>
            <div className="stat-item"><div className="stat-value">{user?.draws || 0}</div><div className="stat-label">平局</div></div>
            <div className="stat-item"><div className="stat-value">{winRate}%</div><div className="stat-label">胜率</div></div>
          </div>
          <button className="btn-match" onClick={handleStartGame}>🎯 开始匹配</button>
        </div>
        <OnlinePlayerList players={onlinePlayers} currentUserId={user?._id} />
      </div>
    </div>
  );
}