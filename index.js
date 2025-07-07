const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/UserRoutes');
const companyRoutes = require('./routes/CompanyRoutes');
const queueRoutes = require('./routes/QueueRoutes');
const connRoutes = require('./routes/ConnectionRoutes');
const evoRoutes = require('./routes/EvolutionRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const contactRoutes = require('./routes/ContactRoute');
const kanbanRoutes = require('./routes/KanbanRoutes');
const webhook = require('./controllers/Webhook');
const filesRoutes = require('./routes/FilesRoutes');
const campaingRoutes = require('./routes/CampaingRoutes')
const tagRoutes = require('./routes/TagRoutes')
const bodyParser = require('body-parser');
const excelRoutes = require('./routes/ExcelRoutes');
const lembreteRoutes = require('./routes/LembretesRoutes');

const cors = require('cors');
// const configureSocket = require('./config/SocketConfig');

const app = express();

// Mapa para rastrear últimos heartbeats dos usuários
const userHeartbeats = new Map();


const corsOptions = {
  origin: ['http://localhost:3001',
    'https://landing-page-front.8rxpnw.easypanel.host',
    'https://eg-crm.effectivegain.com',
    'https://ilhadogovernador.effectivegain.com/',
    'https://ilhadogovernador.effectivegain.com',
    'https://barreiras.effectivegain.com',
    'https://barreiras.effectivegain.com/'
  ],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
};

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3001',
      'https://landing-page-front.8rxpnw.easypanel.host',
      'https://eg-crm.effectivegain.com',
      'https://landing-page-teste.8rxpnw.easypanel.host/',
      'https://ilhadogovernador.effectivegain.com/',
      'https://ilhadogovernador.effectivegain.com',
      'https://barreiras.effectivegain.com',
      'https://barreiras.effectivegain.com/'
    ], 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Criar servidor socket separado na porta 3333
const socketServer = http.createServer();
const socketIoServer = socketIo(socketServer, {
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

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('join', (userId) => {
    console.log('Usuário entrou na sala:', userId);
    socket.join(`user_${userId}`);
  });


  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Socket server na porta 3333
socketIoServer.on('connection', (socket) => {
  console.log('Novo cliente conectado na porta 3333');

  // Evento para quando o usuário faz login e conecta ao socket
  socket.on('user_login', async (data) => {
    try {
      const { userId, schema } = data;
      const { changeOnline } = require('./services/UserService');
      
      await changeOnline(userId, schema);
      socket.userId = userId;
      socket.schema = schema;
      
      // Adicionar ao mapa de heartbeats
      userHeartbeats.set(`${userId}_${schema}`, Date.now());
      
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
    console.log('Cliente desconectado da porta 3333');
    
    // Se o socket tem userId, marcar como offline
    if (socket.userId && socket.schema) {
      try {
        const { changeOffline } = require('./services/UserService');
        await changeOffline(socket.userId, socket.schema);
        
        // Remover do mapa de heartbeats
        userHeartbeats.delete(`${socket.userId}_${socket.schema}`);
        
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
        // Adicionar/atualizar no mapa de heartbeats
        userHeartbeats.set(`${userId}_${schema}`, Date.now());
        console.log(`👤 Usuário ${userId} voltou à aba (online)`);
      } else {
        await changeOffline(userId, schema);
        // Remover do mapa de heartbeats
        userHeartbeats.delete(`${userId}_${schema}`);
        console.log(`👤 Usuário ${userId} saiu da aba (offline)`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status de visibilidade:', error);
    }
  });

  socket.on('leadMoved', (data) => {
    socket.broadcast.emit('leadMoved', data);
  });

  // Handler para heartbeat - manter usuário online
  socket.on('heartbeat', async (data) => {
    try {
      const { userId, schema } = data;
      const { changeOnline } = require('./services/UserService');
      
      await changeOnline(userId, schema);
      
      // Atualizar timestamp do último heartbeat
      userHeartbeats.set(`${userId}_${schema}`, Date.now());
      
      console.log(`💓 Heartbeat recebido do usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao processar heartbeat:', error);
    }
  });
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/webhook', webhook((msg) => io.emit('message', msg)));
app.use('/api', userRoutes);
app.use('/company', companyRoutes);
app.use('/queue', queueRoutes);
app.use('/connection', connRoutes);
app.use('/evo', evoRoutes);
app.use('/chat', chatRoutes);
app.use('/contact', contactRoutes);
app.use('/kanban', kanbanRoutes);
app.use('/files', filesRoutes);
app.use('/campaing', campaingRoutes)
app.use('/tag', tagRoutes)
app.use('/excel', excelRoutes);
app.use('/lembretes', lembreteRoutes);

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.post('/webhook/audio', async (req, res) => {
  const { type, body, from } = req.body;

  if (type === 'audio' && body.startsWith('http')) {

    try {
      console.log('Baixando áudio do URL:', body);
      const response = await axios.get(body, { responseType: 'stream' });
      const writer = fs.createWriteStream(oggPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log('Convertendo áudio para MP3...');
      await new Promise((resolve, reject) => {
        ffmpeg(oggPath)
          .toFormat('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(mp3Path);
      });

      console.log('Áudio processado com sucesso:', mp3Path);
      res.sendStatus(200);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      res.sendStatus(500);
    }
  } else {
    console.log('Requisição de áudio ignorada. Tipo ou URL inválido.');
    res.sendStatus(204);
  }
});


const PORT = 3002;

server.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT} 🚀`);
});

// Iniciar servidor socket na porta 3333
socketServer.listen(3333, () => {
  console.log(`Socket rodando na porta 3333`);
});

// Sistema de limpeza automática de usuários offline
setInterval(async () => {
  const now = Date.now();
  const timeout = 2 * 60 * 1000; // 2 minutos
  
  for (const [key, lastHeartbeat] of userHeartbeats.entries()) {
    if (now - lastHeartbeat > timeout) {
      const [userId, schema] = key.split('_');
      
      try {
        const { changeOffline } = require('./services/UserService');
        await changeOffline(userId, schema);
        userHeartbeats.delete(key);
        console.log(`⏰ Usuário ${userId} marcado como offline por timeout`);
      } catch (error) {
        console.error(`Erro ao marcar usuário ${userId} como offline:`, error);
      }
    }
  }
}, 60000); // Verificar a cada minuto