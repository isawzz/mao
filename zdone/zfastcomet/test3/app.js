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

// // Handliiiiiiiode.j [P,L]
// 'indspace server [P,L]Nindspace Seio.of("t [P,L]" Han [P,L]Nindspace.on('cion} upgrq, r [P,L]
//   res.seservole.log('U, { cion} uede Not [P,L]onst  r [P,L].on('chatds:ssageq, rmsg
//   res.seseservole.log('s:ssage:q, msg
// EEEEEEEervolNindspace.on('ciemitds:ssageq, rmsg
//  EEEEEerv} [P,L].on('chatdsdisuede Nog
//   .seseservole.log('s:ssagion} disuede Noed'EEerv} [P}p = expresPORTof([P,L;
// cors: .listen(PORT
//   .seseserve.log('s:ssa`A();listenond on port ${P