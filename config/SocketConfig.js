const http = require('http');
const socketIo = require('socket.io');

function configureSocket(io, server) {
  io.on('connection', (socket) => {

    socket.on('sendMessage', (data) => {
        console.log('Mensagem recebida:', data);
        io.emit('newMessage', data); 
      });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
}

module.exports = configureSocket;
