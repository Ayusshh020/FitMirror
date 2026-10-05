const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const env = require('./config/env');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect Database and start HTTP Server
const startServer = async () => {
  await connectDB();
  server.listen(env.port, () => {
    console.log(`===========================================`);
    console.log(`🚀 FitMirror Backend Server running on port ${env.port}`);
    console.log(`🌐 Environment: ${env.nodeEnv}`);
    console.log(`===========================================`);
  });
};

startServer();
