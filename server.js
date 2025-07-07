const express = require('express');
const http = require('http');
const { Server } = require('socket.io');


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

            // Evento para quando o usuário faz login e conecta ao socket
            socket.on('user_login', async (data) => {
                try {
                    const { userId, schema } = data;
                    const { changeOnline } = require('./services/UserService');
                    
                    await changeOnline(userId, schema);
                    socket.userId = userId;
                    socket.schema = schema;
                    
                    console.log(`👤 Usuário ${userId} marcado como online`);
                } catch (error) {
                    console.error('Erro ao marcar usuário como online:', error);
                }
            });

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


            socket.on('disconnect', async () => {
                console.log('Cliente desconectado');
                
                // Se o socket tem userId, marcar como offline
                if (socket.userId && socket.schema) {
                    try {
                        const { changeOffline } = require('./services/UserService');
                        await changeOffline(socket.userId, socket.schema);
                        
                        console.log(`👤 Usuário ${socket.userId} marcado como offline`);
                    } catch (error) {
                        console.error('Erro ao marcar usuário como offline:', error);
                    }
                }
            });

            socket.on('message', (message) => {
                socket.broadcast.emit('message', message);
            });

            socket.on('lembrete', (data)=>{
                socket.broadcast.emit('lembrete', data);
            })

            // Evento para detectar quando a aba do navegador é fechada
            socket.on('page_visibility_change', async (data) => {
                try {
                    const { isVisible, userId, schema } = data;
                    const { changeOnline, changeOffline } = require('./services/UserService');
                    
                    console.log(`📥 Recebido evento page_visibility_change:`, { isVisible, userId, schema });
                    
                    if (isVisible) {
                        await changeOnline(userId, schema);
                        console.log(`👤 Usuário ${userId} voltou à aba (online)`);
                    } else {
                        await changeOffline(userId, schema);
                        console.log(`👤 Usuário ${userId} saiu da aba (offline)`);
                    }
                } catch (error) {
                    console.error('Erro ao atualizar status de visibilidade:', error);
                }
            });

            socket.on('leadMoved', (data) => {
                socket.broadcast.emit('leadMoved', data);
            });

            // 🤖 EVENTOS DO ROBÔ DE IA
            socket.on('ai_bot_activate', async (data) => {
                try {
                    const { phoneNumber, chatId, instanceId, schema } = data;
                    const AIAssistantService = require('./services/AIAssistantService');
                    
                    AIAssistantService.activateBot(phoneNumber, chatId, instanceId, schema);
                    
                    // Notificar todos os clientes conectados
                    this.io.to(schema).emit('ai_bot_activated', {
                        phoneNumber,
                        chatId,
                        timestamp: new Date()
                    });
                    
                    console.log(`🤖 Robô ativado via socket para ${phoneNumber}`);
                } catch (error) {
                    console.error('Erro ao ativar robô via socket:', error);
                }
            });

            socket.on('ai_bot_deactivate', async (data) => {
                try {
                    const { phoneNumber, schema } = data;
                    const AIAssistantService = require('./services/AIAssistantService');
                    
                    const deactivated = AIAssistantService.deactivateBot(phoneNumber);
                    
                    if (deactivated) {
                        // Notificar todos os clientes conectados
                        this.io.to(schema).emit('ai_bot_deactivated', {
                            phoneNumber,
                            reason: 'manual_deactivation',
                            timestamp: new Date()
                        });
                        
                        console.log(`🤖 Robô desativado via socket para ${phoneNumber}`);
                    }
                } catch (error) {
                    console.error('Erro ao desativar robô via socket:', error);
                }
            });

            socket.on('ai_bot_status', async (data) => {
                try {
                    const { phoneNumber } = data;
                    const AIAssistantService = require('./services/AIAssistantService');
                    
                    const botInfo = AIAssistantService.getBotInfo(phoneNumber);
                    
                    // Enviar status de volta para o cliente que solicitou
                    socket.emit('ai_bot_status_response', {
                        phoneNumber,
                        isActive: !!botInfo,
                        botInfo
                    });
                } catch (error) {
                    console.error('Erro ao verificar status do robô via socket:', error);
                }
            });

            socket.on('ai_bot_list', async (data) => {
                try {
                    const AIAssistantService = require('./services/AIAssistantService');
                    
                    const activeBots = AIAssistantService.getActiveBots();
                    
                    // Enviar lista de volta para o cliente que solicitou
                    socket.emit('ai_bot_list_response', {
                        activeBots,
                        count: activeBots.length
                    });
                } catch (error) {
                    console.error('Erro ao listar robôs via socket:', error);
                }
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
