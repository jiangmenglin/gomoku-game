import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket, connectSocket } from '../utils/socket';
import Board from '../components/Board';
import PlayerInfo from '../components/PlayerInfo';
import api from '../utils/api';

export default function GamePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('waiting'); // waiting | playing | finished
  const [gameId, setGameId] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [myInfo, setMyInfo] = useState(null);
  const [board, setBoard] = useState(Array(15).fill(null).map(() => Array(15).fill(0)));
  const [currentTurn, setCurrentTurn] = useState('black');
  const [lastMove, setLastMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    let socket = getSocket();
    if (!socket || !socket.connected) {
      socket = connectSocket(token);
      socket.on('connect', () => {
        socket.emit('startMatching');
      });
    }

    const onGameStart = (data) => {
      setGameId(data.gameId);
      setMyColor(data.color);
      setOpponent(data.opponent);
      setMyInfo(data.myInfo);
      setGameState('playing');
      setBoard(Array(15).fill(null).map(() => Array(15).fill(0)));
      setCurrentTurn('black');
      setLastMove(null);
      setGameResult(null);
      checkFriendship(data.opponent._id);
    };

    const onMoveMade = (data) => {
      setBoard(prev => {
        const newBoard = prev.map(r => [...r]);
        newBoard[data.row][data.col] = data.piece;
        return newBoard;
      });
      setCurrentTurn(data.currentTurn);
      setLastMove({ row: data.row, col: data.col });
    };

    const onGameOver = (data) => {
      setGameState('finished');
      let result;
      if (data.winner === 'draw') {
        result = { type: 'draw', message: '🤝 平局！' };
      } else if (data.winner === 'opponent_left') {
        result = { type: 'win', message: '🎉 对手离开，你赢了！' };
      } else if (data.winner === myColor) {
        result = { type: 'win', message: '🎉 恭喜，你赢了！' };
      } else {
        result = { type: 'lose', message: '😔 很遗憾，你输了' };
      }
      setGameResult(result);
    };

    const onWaiting = () => {
      setGameState('waiting');
    };

    socket.on('gameStart', onGameStart);
    socket.on('moveMade', onMoveMade);
    socket.on('gameOver', onGameOver);
    socket.on('waiting', onWaiting);

    return () => {
      socket.off('gameStart', onGameStart);
      socket.off('moveMade', onMoveMade);
      socket.off('gameOver', onGameOver);
      socket.off('waiting', onWaiting);
    };
    // eslint-disable-next-line
  }, [token, myColor]);

  const checkFriendship = async (friendId) => {
    try {
      const res = await api.get('/friend/check/' + friendId);
      setIsFriend(res.data.isFriend);
    } catch(e) { /* ignore */ }
  };

  const handleCellClick = useCallback((row, col) => {
    if (gameState !== 'playing') return;
    if (currentTurn !== myColor) return;
    if (board[row][col] !== 0) return;
    const socket = getSocket();
    if (socket) socket.emit('makeMove', { gameId, row, col });
  }, [gameState, currentTurn, myColor, board, gameId]);

  const handleAddFriend = async () => {
    try {
      await api.post('/friend/add', { friendId: opponent._id });
      setIsFriend(true);
    } catch(e) {
      alert(e.response?.data?.message || '添加好友失败');
    }
  };

  const handleReturnToRoom = () => {
    const socket = getSocket();
    if (socket) socket.emit('returnToRoom');
    navigate('/room');
  };

  const handleCancelMatching = () => {
    const socket = getSocket();
    if (socket) socket.emit('cancelMatching');
    navigate('/room');
  };

  const isMyTurn = currentTurn === myColor;

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>♟️ 五子棋对战</h2>
      </div>

      {gameState === 'waiting' && (
        <div className="waiting-overlay">
          <div className="waiting-card">
            <div className="spinner"></div>
            <h2>正在匹配对手...</h2>
            <p style={{color:'#999', marginBottom:20}}>请稍候，正在寻找匹配的玩家</p>
            <button className="btn btn-secondary" onClick={handleCancelMatching}>取消匹配</button>
          </div>
        </div>
      )}

      {gameState !== 'waiting' && (
        <div className="game-content">
          <Board board={board} onCellClick={handleCellClick} lastMove={lastMove} />
          <div className="player-panel">
            <div className={'turn-indicator ' + (isMyTurn ? 'turn-mine' : 'turn-opponent')}>
              {gameState === 'finished' ? '游戏结束' : (isMyTurn ? '✨ 轮到你下棋' : '⏳ 对手下棋中...')}
            </div>
            <h3>我的信息</h3>
            <PlayerInfo player={myInfo} color={myColor} isMe={true} />
            <h3>对手信息</h3>
            <PlayerInfo
              player={opponent}
              color={myColor === 'black' ? 'white' : 'black'}
              isFriend={isFriend}onAddFriend={handleAddFriend}
              isMe={false}
            />
          </div>
        </div>
      )}

      {gameResult && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2 className={gameResult.type}>{gameResult.message}</h2>
            <p>感谢参与游戏！</p>
            <button className="btn btn-primary" style={{width:'auto', padding:'12px 40px'}} onClick={handleReturnToRoom}>
              返回大厅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}