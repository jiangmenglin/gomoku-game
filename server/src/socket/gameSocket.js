const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function setupGameSocket(io) {
  const onlineUsers = new Map();
  const waitingQueue = [];
  const games = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.username = user.username;
      next();
    } catch(e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.username);
    onlineUsers.set(socket.userId, socket);
    await User.findByIdAndUpdate(socket.userId, { status: 'idle' });
    broadcastOnlineUsers();

    socket.on('startMatching', async () => {
      const alreadyInQueue = waitingQueue.find(s => s.userId === socket.userId);
      if (alreadyInQueue) return;

      if (waitingQueue.length > 0) {
        const opponent = waitingQueue.shift();
        if (!opponent.connected) {
          waitingQueue.push(socket);
          return;
        }

        const gameId = socket.userId + '_' + opponent.userId + '_' + Date.now();
        const blackPlayer = Math.random() > 0.5 ? socket : opponent;
        const whitePlayer = blackPlayer === socket ? opponent : socket;

        const game = {
          id: gameId,
          board: Array(15).fill(null).map(() => Array(15).fill(0)),
          black: { id: blackPlayer.userId, username: blackPlayer.username },
          white: { id: whitePlayer.userId, username: whitePlayer.username },
          currentTurn: 'black',
          moveCount: 0,
          finished: false
        };
        games.set(gameId, game);

        blackPlayer.gameId = gameId;
        whitePlayer.gameId = gameId;
        blackPlayer.join(gameId);
        whitePlayer.join(gameId);

        await User.findByIdAndUpdate(blackPlayer.userId, { status: 'playing' });
        await User.findByIdAndUpdate(whitePlayer.userId, { status: 'playing' });
        broadcastOnlineUsers();

        const blackUser = await User.findById(blackPlayer.userId).select('-password');
        const whiteUser = await User.findById(whitePlayer.userId).select('-password');

        blackPlayer.emit('gameStart', {
          gameId,
          color: 'black',
          opponent: { _id: whiteUser._id, username: whiteUser.username, wins: whiteUser.wins, losses: whiteUser.losses, draws: whiteUser.draws },
          myInfo: { _id: blackUser._id, username: blackUser.username, wins: blackUser.wins, losses: blackUser.losses, draws: blackUser.draws }
        });
        whitePlayer.emit('gameStart', {
          gameId,
          color: 'white',
          opponent: { _id: blackUser._id, username: blackUser.username, wins: blackUser.wins, losses: blackUser.losses, draws: blackUser.draws },
          myInfo: { _id: whiteUser._id, username: whiteUser.username, wins: whiteUser.wins, losses: whiteUser.losses, draws: whiteUser.draws }
        });
      } else {
        waitingQueue.push(socket);socket.emit('waiting', { message:'Waiting for opponent...' });
      }
    });

    socket.on('cancelMatching', () => {
      const idx = waitingQueue.findIndex(s => s.userId === socket.userId);
      if (idx !== -1) waitingQueue.splice(idx, 1);
    });

    socket.on('makeMove', async ({ gameId, row, col }) => {
      const game = games.get(gameId);
      if (!game || game.finished) return;

      const isBlack = game.black.id === socket.userId;
      const isWhite = game.white.id === socket.userId;
      if (!isBlack && !isWhite) return;
      if ((game.currentTurn === 'black' && !isBlack) || (game.currentTurn === 'white' && !isWhite)) return;
      if (game.board[row][col] !== 0) return;

      game.board[row][col] = isBlack ? 1 : 2;
      game.moveCount++;
      const piece = isBlack ? 1 : 2;

      io.to(gameId).emit('moveMade', {
        row, col, piece,
        currentTurn: game.currentTurn === 'black' ? 'white' : 'black'
      });

      if (checkWin(game.board, row, col, piece)) {
        game.finished = true;
        const winnerId = socket.userId;
        const loserId = isBlack ? game.white.id : game.black.id;
        await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
        await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
        io.to(gameId).emit('gameOver', { winner: game.currentTurn, winnerName: socket.username });
        return;
      }

      if (game.moveCount >= 225) {
        game.finished = true;
        await User.findByIdAndUpdate(game.black.id, { $inc: { draws: 1 } });
        await User.findByIdAndUpdate(game.white.id, { $inc: { draws: 1 } });
        io.to(gameId).emit('gameOver', { winner: 'draw', winnerName: null });
        return;
      }

      game.currentTurn = game.currentTurn === 'black' ? 'white' : 'black';
    });

    socket.on('leaveGame', async () => {
      if (socket.gameId) {
        const game = games.get(socket.gameId);
        if (game && !game.finished) {
          game.finished = true;
          const isBlack = game.black.id === socket.userId;
          const winnerId = isBlack ? game.white.id : game.black.id;
          const loserId = socket.userId;
          await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
          await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
          const winnerName = isBlack ? game.white.username : game.black.username;
          io.to(socket.gameId).emit('gameOver', { winner: 'opponent_left', winnerName });
        }
        socket.leave(socket.gameId);games.delete(socket.gameId);
        socket.gameId = null;
        await User.findByIdAndUpdate(socket.userId, { status: 'idle' });
        broadcastOnlineUsers();
      }
    });

    socket.on('returnToRoom', async () => {
      if (socket.gameId) {
        socket.leave(socket.gameId);
        games.delete(socket.gameId);
        socket.gameId = null;
      }
      await User.findByIdAndUpdate(socket.userId, { status: 'idle' });
      broadcastOnlineUsers();
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.username);
      const idx = waitingQueue.findIndex(s => s.userId === socket.userId);
      if (idx !== -1) waitingQueue.splice(idx, 1);

      if (socket.gameId) {
        const game = games.get(socket.gameId);
        if (game && !game.finished) {
          game.finished = true;
          const isBlack = game.black.id === socket.userId;
          const winnerId = isBlack ? game.white.id : game.black.id;
          await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
          await User.findByIdAndUpdate(socket.userId, { $inc: { losses: 1 } });
          const winnerName = isBlack ? game.white.username : game.black.username;
          io.to(socket.gameId).emit('gameOver', { winner: 'opponent_left', winnerName });
        }
        games.delete(socket.gameId);}

      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { status: 'away' });
      broadcastOnlineUsers();
    });

    async function broadcastOnlineUsers() {
      const users = await User.find({ status: { $ne: 'away' } }).select('-password');
      io.emit('onlineUsers', users);
    }
  });

  function checkWin(board, row, col, piece) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === piece) count++;
        else break;
      }
      for (let i = 1; i < 5; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === piece) count++;
        else break;
      }
      if (count >= 5) return true;
    }
    return false;
  }
};