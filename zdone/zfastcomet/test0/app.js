const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
//const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: "*", // or restrict to "http://127.0.0.1:51683" if you want
    methods: ["GET", "POST"]
  }
});

// Serve a simple page to verify it works
app.get('/', (req, res) => {
  res.send('Socket.IO server is running!');
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Listen on internal port
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
