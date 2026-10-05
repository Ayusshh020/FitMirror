const { Server } = require('socket.io');
const env = require('./env');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Client emits join to register their user ID room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`[Socket.io] User ${userId} joined room ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
