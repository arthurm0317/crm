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
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/webhook', webhook(io));
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

    io.emit('message', sentMessage);

    res.status(200).json({ success: true, message: sentMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

configureSocket(io, server);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
