const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve index.html directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the socket namespace
const socketNamespace = io.of("/socket");

socketNamespace.on('connection', (socket) => {
  console.log('User connected to /socket');

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
  console.log(`App listening on port ${PORT}`);
});
