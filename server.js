const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app)

const io = require('socket.io')(server, {
    cors:{
        origin:[
            "http://localhost:3001",
        ],
        methods: ["GET", "POST"]
    }
})

app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from server!' });
});
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(3000)