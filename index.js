const express = require('express');
const http = require('http');
const WebSocket = require('ws'); // substitui socket.io
const userRoutes = require('./routes/UserRoutes');
const companyRoutes = require('./routes/CompanyRoutes');
const queueRoutes = require('./routes/QueueRoutes');
const connRoutes = require('./routes/ConnectionRoutes');
const evoRoutes = require('./routes/EvolutionRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const webhook = require('./controllers/Webhook'); // vai precisar receber wsHandler
const contactRoutes = require('./routes/ContactRoute');
const kanbanRoutes = require('./routes/KanbanRoutes');

const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    clients.delete(ws);
  });

  ws.on('message', (message) => {
    console.log('Mensagem recebida do cliente WebSocket:', message);
  });
});

// Função para emitir mensagens a todos os clientes conectados
const broadcastMessage = (data) => {
  const json = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
};

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/webhook', webhook(broadcastMessage)); // Enviamos a função para emitir as mensagens
app.use('/api', userRoutes);
app.use('/company', companyRoutes);
app.use('/queue', queueRoutes);
app.use('/connection', connRoutes);
app.use('/evo', evoRoutes);
app.use('/chat', chatRoutes(broadcastMessage)); // Também aqui, se necessário
app.use('/contact', contactRoutes);
app.use('/kanban', kanbanRoutes);

app.post('/webhook/audio', async (req, res) => {
  const { type, body, from } = req.body;

  if (type === 'audio' && body.startsWith('http')) {
    const timestamp = Date.now();
    const oggPath = path.join(__dirname, 'audios', `${from}-${timestamp}.ogg`);
    const mp3Path = path.join(__dirname, 'audios', `${from}-${timestamp}.mp3`);

    try {
      const response = await axios.get(body, { responseType: 'stream' });
      const writer = fs.createWriteStream(oggPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await new Promise((resolve, reject) => {
        ffmpeg(oggPath)
          .toFormat('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(mp3Path);
      });

      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(204);
  }
});

app.post('/chat/sendMessage', async (req, res) => {
  const { chatId, message, schema, replyTo } = req.body;

  try {
    const sentMessage = {
      chatId,
      body: message,
      fromMe: true,
      replyTo,
      timestamp: Date.now(),
    };

    broadcastMessage({ type: 'message', ...sentMessage });

    res.status(200).json({ success: true, message: sentMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
