const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const multer = require('multer');
const { saveMessage } = require('../services/MessageService');
const pool = require('../db/queries')

module.exports = (io) => {
  const express = require('express');
  const app = express.Router();
  const { v4: uuidv4 } = require('uuid');
  const { Chat } = require('../entities/Chat');
  const { Message } = require('../entities/Message');
  const { createChat, getChatService, setChatQueue, setUserChat } = require('../services/ChatService');

  app.post('/chat', async (req, res) => {
    const result = req.body;
    const schema = req.body.schema || 'effective_gain';

    let contact = result.data.key.remoteJid.split('@')[0];
    try {
      contact = result.data.key.fromMe ? result.data.key.remoteJid.split('@')[0] : result.data.pushName;

      const timestamp = new Date(result.date_time).getTime();
      const chat = new Chat(
        uuidv4(),
        result.data.key.remoteJid,
        result.data.instanceId,
        null,
        result.data.key.fromMe,
        contact,
        null,
        result.data.status,
        timestamp,
        []
      );
      let messageBody = '';

      if (result.data.message?.conversation) {
        messageBody = result.data.message.conversation;
      } else if (result.data.message?.audioMessage?.url) {
        const audioUrl = result.data.message.audioMessage.url;
        const audioFolder = path.join(__dirname, '..', 'audios');
        if (!fs.existsSync(audioFolder)) fs.mkdirSync(audioFolder);

        const oggPath = path.join(audioFolder, `${contact}-${timestamp}.ogg`);
        const mp3Path = path.join(audioFolder, `${contact}-${timestamp}.mp3`);

        try {
          const response = await axios.get(audioUrl, { responseType: 'stream' });
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

          messageBody = `[Áudio recebido: ${path.basename(mp3Path)}]`;
        } catch (err) {
          console.error('Erro ao baixar/converter áudio:', err);
          messageBody = '[Erro ao processar áudio]';
        }
      }

      const createChats = await createChat(chat, result.instance, result.data.message.conversation, null, io);
      const chatDb = await getChatService(createChats.chat, createChats.schema );

      const existingMessage = await pool.query(
        `SELECT id FROM ${schema}.messages WHERE id = $1`,
        [result.data.key.id]
      );
      
      if (existingMessage.rowCount > 0) {
        console.log('Mensagem já existe, ignorando inserção.');
      } else {
        await saveMessage(
          chatDb.id,
          new Message(
            result.data.key.id,
            messageBody,
            result.data.key.fromMe,
            result.data.key.remoteJid,
            result.data.pushName,
            timestamp
          ),
          schema
        );
      }

      await setChatQueue(schema, chatDb.chat_id);
      await setUserChat(chatDb.id, schema)

      console.log('Emitindo mensagem para o socket:', {
        chatId: chatDb.id,
        body: messageBody,
        fromMe: result.data.key.fromMe,
        from: result.data.pushName,
        timestamp,
      });

      io.emit('message', {
        chatId: chatDb.id,
        body: messageBody,
        fromMe: result.data.key.fromMe,
        from: result.data.pushName,
        timestamp,
      });


      res.status(200).json({ result });
    } catch (err) {
      console.error('Erro no webhook /chat:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/chat/sendMessage', async (req, res) => {
    const { chatId, message, schema } = req.body;

    try {
      const sentMessage = {
        chatId,
        body: message,
        fromMe: true,
        timestamp: Date.now(),
      };

      io.emit('message', sentMessage);

      res.status(200).json({ success: true, message: sentMessage });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      res.status(500).json({ error: err.message });
    }
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const audioFolder = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(audioFolder)) fs.mkdirSync(audioFolder);
      cb(null, audioFolder);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({ storage });

  app.post('/chat/sendAudio', upload.single('audio'), async (req, res) => {
    const { chatId, schema } = req.body;
    const audioFile = req.file;

    try {
      const sentAudio = {
        chatId,
        body: null,
        audioUrl: `/uploads/${audioFile.filename}`,
        fromMe: true,
        timestamp: Date.now(),
      };

      io.emit('message', sentAudio);

      res.status(200).json({ success: true, message: sentAudio });
    } catch (err) {
      console.error('Erro ao enviar áudio:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
};