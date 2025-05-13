const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

class SocketServer {
    constructor(port = 3002) {
        this.app = express();
        this.port = port;

        this.server = http.createServer(this.app);

       this.io = new Server(this.server, {
        cors: {
            origin: [
            "http://localhost:3001", 
            "chrome-extension://ophmdkgfcjapomjdpfobjfbihojchbko"  
            ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

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
           

            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });

            socket.on('message',(message)=>{
                socket.broadcast.emit('message', message)
                console.log(message)
            }
            )
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Servidor rodando na porta ${this.port}`);
        });
    }
}

module.exports = SocketServer;
