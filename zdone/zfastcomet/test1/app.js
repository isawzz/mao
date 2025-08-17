const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.get('/', (req, res) => { res.send('Socket.IO server is running!'); });

const socketNamespace = io.of("/socket");

socketNamespace.on('connection', (socket) => {
  console.log('A user connected to /socket');

  socket.on('chat message', (msg) => {
    console.log('message:', msg);
    socketNamespace.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
