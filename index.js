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
const cookieParser = require('cookie-parser');

const app = express();

// const userHeartbeats = new Map();


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
  credentials: true
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

  socket.on('contatosImportados', (data) => {
    socket.broadcast.emit('contatosImportados', data);
  });
});

socketIoServer.on('connection', (socket) => {
  console.log('Novo cliente conectado na porta 3333');

  socket.on('user_login', async (data) => {
    try {
      const { userId, schema } = data;
      // const { changeOnline } = require('./services/UserService');
      
      // await changeOnline(userId, schema);
      socket.userId = userId;
      socket.schema = schema;
      
      // userHeartbeats.set(`${userId}_${schema}`, Date.now());
      
      console.log(`👤 Usuário ${userId} conectado`);
    } catch (error) {
      console.error('Erro ao conectar usuário:', error);
    }
  });

  socket.on('join', (room) => {
    console.log('Cliente entrou na sala:', room);
    socket.join(room);
    
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
    
    if (socket.userId && socket.schema) {
      try {
        // const { changeOffline } = require('./services/UserService');
        // await changeOffline(socket.userId, socket.schema);
        
        // userHeartbeats.delete(`${socket.userId}_${socket.schema}`);
        
        console.log(`👤 Usuário ${socket.userId} desconectado`);
      } catch (error) {
        console.error('Erro ao desconectar usuário:', error);
      }
    }
  });

  socket.on('message', (message) => {
    socket.broadcast.emit('message', message);
  });

  socket.on('lembrete', (data)=>{
    socket.broadcast.emit('lembrete', data);
  })

  // socket.on('page_visibility_change', async (data) => {
  //   try {
  //     const { isVisible, userId, schema } = data;
  //     const { changeOnline, changeOffline } = require('./services/UserService');
      
  //     console.log(`📥 Recebido evento page_visibility_change:`, { isVisible, userId, schema });
      
  //     if (isVisible) {
  //       await changeOnline(userId, schema);
  //       userHeartbeats.set(`${userId}_${schema}`, Date.now());
  //       console.log(`👤 Usuário ${userId} voltou à aba (online)`);
  //     } else {
  //       await changeOffline(userId, schema);
  //       userHeartbeats.delete(`${userId}_${schema}`);
  //       console.log(`👤 Usuário ${userId} saiu da aba (offline)`);
  //     }
  //   } catch (error) {
  //     console.error('Erro ao atualizar status de visibilidade:', error);
  //   }
  // });

  socket.on('leadMoved', (data) => {
    socket.broadcast.emit('leadMoved', data);
  });

  // socket.on('heartbeat', async (data) => {
  //   try {
  //     const { userId, schema } = data;
  //     const { changeOnline } = require('./services/UserService');
      
  //     await changeOnline(userId, schema);
      
  //     userHeartbeats.set(`${userId}_${schema}`, Date.now());
      
  //     console.log(`Heartbeat recebido do usuário ${userId}`);
  //   } catch (error) {
  //     console.error('Erro ao processar heartbeat:', error);
  //   }
  // });
});

app.use(cors(corsOptions));
app.use(cookieParser());
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

socketServer.listen(3333, () => {
  console.log(`Socket rodando na porta 3333`);
});

// setInterval(async () => {
//   const now = Date.now();
//   const timeout = 2 * 60 * 1000; 
  
//   for (const [key, lastHeartbeat] of userHeartbeats.entries()) {
//     if (now - lastHeartbeat > timeout) {
//       const [userId, schema] = key.split('_');
      
//       try {
//         const { changeOffline } = require('./services/UserService');
//         await changeOffline(userId, schema);
//         userHeartbeats.delete(key);
//         console.log(`⏰ Usuário ${userId} marcado como offline por timeout`);
//       } catch (error) {
//         console.error(`Erro ao marcar usuário ${userId} como offline:`, error);
//       }
//     }
//   }
// }, 60000); 