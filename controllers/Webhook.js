const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Chat } = require('../entities/Chat');
const { Message } = require('../entities/Message');
const { createChat, getChatService, setChatQueue, setUserChat } = require('../services/ChatService');
const { saveMessage } = require('../services/MessageService');
const pool = require('../db/queries');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = (broadcastMessage) => {
  const express = require('express');
  const app = express.Router();

  const ensureAudioFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  };

  const downloadAndConvertAudio = async (audioUrl, contact, timestamp) => {
    const audioFolder = path.join(__dirname, '..', 'audios');
    ensureAudioFolder(audioFolder);

    const oggPath = path.join(audioFolder, `${contact}-${timestamp}.ogg`);
    const mp3Path = path.join(audioFolder, `${contact}-${timestamp}.mp3`);

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

    return path.basename(mp3Path);
  };

  app.post('/chat', async (req, res) => {
    const result = req.body;
    const schema = req.body.schema || 'effective_gain';

    if (!result?.data?.key?.remoteJid) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const contact = result.data.key.fromMe
      ? result.data.key.remoteJid.split('@')[0]
      : result.data.pushName || result.data.key.remoteJid.split('@')[0];

    try {
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
      let audioFileName = null;

      if (result.data.message?.conversation) {
        messageBody = result.data.message.conversation;
      } else if (result.data.message?.audioMessage?.url) {
        try {
          audioFileName = await downloadAndConvertAudio(result.data.message.audioMessage.url, contact, timestamp);
          messageBody = `[áudio recebido: ${audioFileName}]`;
        } catch (err) {
          console.error('erro ao baixar/converter áudio:', err);
          messageBody = '[erro ao processar áudio]';
        }
      }

      const createChats = await createChat(chat, result.instance, result.data.message.conversation, null);
      const chatDb = await getChatService(createChats.chat, createChats.schema);

      const existingMessage = await pool.query(
        `SELECT id FROM ${schema}.messages WHERE id = $1`,
        [result.data.key.id]
      );

      if (existingMessage.rowCount === 0) {
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
      await setUserChat(chatDb.id, schema);

      const payload = {
        chatId: chatDb.id,
        body: messageBody,
        audioUrl: audioFileName ? `/audios/${audioFileName}` : null,
        fromMe: result.data.key.fromMe,
        from: result.data.pushName,
        timestamp,
      };

      broadcastMessage({ type: 'message', payload });

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

      broadcastMessage({ type: 'message', payload: sentMessage });

      res.status(200).json({ success: true, message: sentMessage });
    } catch (err) {
      console.error('erro ao enviar mensagem:', err);
      res.status(500).json({ error: err.message });
    }
  });


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const audioFolder = path.join(__dirname, '..', 'uploads');
      ensureAudioFolder(audioFolder);
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

      broadcastMessage({ type: 'message', payload: sentAudio });

      res.status(200).json({ success: true, message: sentAudio });
    } catch (err) {
      console.error('erro ao enviar áudio:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
};
