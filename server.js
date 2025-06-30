const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ChatInternoService = require('./services/ChatInternoService');


class SocketServer {
    constructor(port = 3333) {
        this.app = express();
        this.port = port;

        this.server = http.createServer(this.app);

        this.io = new Server(this.server, {
            cors: {
                origin: [
                    "http://localhost:3001", 
                    "chrome-extension://ophmdkgfcjapomjdpfobjfbihojchbko",
                    "https://landing-page-teste.8rxpnw.easypanel.host",
                    "https://landing-page-front.8rxpnw.easypanel.host",
                    "https://eg-crm.effectivegain.com",
                    "https://ilhadogovernador.effectivegain.com",
                    "https://barreiras.effectivegain.com"
                ],
                methods: ["GET", "POST", "DELETE", "PUT"],
                allowedHeaders: ["Content-Type"],
                credentials: true
            }
        });

        // 🟩 Exporta o io estaticamente
        SocketServer.io = this.io;

        this.middlewares();
        this.routes();
        this.sockets();
    }

    middlewares() {
        this.app.use(express.json());
    }

    routes() {
        this.app.get('/api/test', (req, res) => {
            res.json({ message: 'Hello from server!' });
        });
    }

    
    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Novo cliente conectado');

            socket.on('join', (room) => {
                console.log('Cliente entrou na sala:', room);
                socket.join(room);
                
                // Se for um userId (não uma sala geral), também adiciona à sala do usuário
                if (room && typeof room === 'string' && room.length > 10) {
                    socket.join(`user_${room}`);
                    console.log('Usuário também entrou na sala pessoal:', `user_${room}`);
                }
            });

            socket.on('leave', (roomId) => {
                socket.leave(roomId);
            });

            // Chat interno - mensagem
            socket.on('internal_message', async (data) => {
                try {
                    const saved = await ChatInternoService.saveMessage(data.sender_id, data.receiver_id, data.message, data.schema);
                    
                    // Enviar para o destinatário
                    this.io.to(`user_${data.receiver_id}`).emit('internal_message', saved);
                    
                    // Enviar para o remetente (confirmação)
                    this.io.to(`user_${data.sender_id}`).emit('internal_message', saved);
                } catch (error) {
                    console.error('Erro ao salvar mensagem:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });

            socket.on('message', (message) => {
                socket.broadcast.emit('message', message);
            });

            socket.on('lembrete', (data)=>{
                socket.broadcast.emit('lembrete', data);
            })

            socket.on('leadMoved', (data) => {
                socket.broadcast.emit('leadMoved', data);
            });
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Servidor rodando na porta ${this.port}`);
        });
    }
}

module.exports = SocketServer;
