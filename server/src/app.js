const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friend');
const setupGameSocket = require('./socket/gameSocket');

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';
const clientOrigin = isProduction ? process.env.CLIENT_ORIGIN : 'http://localhost:3000';

const io = new Server(server, { cors: { origin: clientOrigin, credentials: true } });

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);

if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

setupGameSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 22;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
