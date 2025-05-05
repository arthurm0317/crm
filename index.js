const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/UserRoutes');
const companyRoutes = require('./routes/CompanyRoutes');
const queueRoutes = require('./routes/QueueRoutes');
const connRoutes = require('./routes/ConnectionRoutes');
const evoRoutes = require('./routes/EvolutionRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const webhook = require('./controllers/Webhook');
const contactRoutes = require('./routes/ContactRoute');
const kanbanRoutes = require('./routes/KanbanRoutes');

const cors = require('cors');
const configureSocket = require('./config/SocketConfig');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
};

const server = http.createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado via WebSocket');

  ws.on('message', (message) => {
    console.log('Mensagem recebida do cliente:', message);

    const parsedMessage = JSON.parse(message);
    const sentMessage = {
      chatId: parsedMessage.chatId,
      body: parsedMessage.message,
      fromMe: true,
      replyTo: parsedMessage.replyTo,
      timestamp: Date.now(),
    };

    console.log('Mensagem processada para envio:', sentMessage);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log('Enviando mensagem para cliente conectado:', JSON.stringify(sentMessage));
        client.send(JSON.stringify(sentMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado do WebSocket');
  });
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
app.use('/webhook', webhook(wss));
app.use('/api', userRoutes);
app.use('/company', companyRoutes);
app.use('/queue', queueRoutes);
app.use('/connection', connRoutes);
app.use('/evo', evoRoutes);
app.use('/chat', chatRoutes);
app.use('/contact', contactRoutes);
app.use('/kanban', kanbanRoutes);

app.post('/webhook/audio', async (req, res) => {
  const { type, body, from } = req.body;

  if (type === 'audio' && body.startsWith('http')) {
    const timestamp = Date.now();
    const oggPath = path.join(__dirname, 'audios', `${from}-${timestamp}.ogg`);
    const mp3Path = path.join(__dirname, 'audios', `${from}-${timestamp}.mp3`);

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

configureSocket(wss, server);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});