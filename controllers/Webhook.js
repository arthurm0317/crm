const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Chat } = require('../entities/Chat');
const { Message } = require('../entities/Message');
const { createChat, getChatService, setChatQueue, setUserChat, saveMediaMessage } = require('../services/ChatService');
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
      const timestamp = new Date(result.data.messageTimestamp).getTime();
      if (!result.data.key.remoteJid || !result.data.instanceId) {
        throw new Error('Dados obrigatórios ausentes: remoteJid ou instanceId');
      }

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
      let audioBase64 = null;
      let imageBase64 = null;

      if (result.data.message?.conversation) {
        messageBody = result.data.message.conversation;
      } else if (result.data.message?.audioMessage) {
        try {
          if (result.data.message.audioMessage.base64) {
            audioBase64 = result.data.message.audioMessage.base64;
          } else if (result.data.message.audioMessage.url) {
            const audioResponse = await axios.get(result.data.message.audioMessage.url, {
              responseType: 'arraybuffer',
            });
            audioBase64 = Buffer.from(audioResponse.data).toString('base64');
          }

          if (audioBase64) {
            await saveMediaMessage(result.data.key.fromMe, chat.id, timestamp, 'audio', audioBase64, schema);
            messageBody = '[áudio recebido]';
          } else {
            throw new Error('Áudio não encontrado ou não processado.');
          }
        } catch (err) {
          console.error('Erro ao processar áudio:', err);
          messageBody = '[erro ao processar áudio]';
        }
      }

      if (result.data.message?.imageMessage) {
        try {
          if (result.data.message.imageMessage.base64) {
            imageBase64 = result.data.message.imageMessage.base64;
          } else if (result.data.message.imageMessage.url) {
            const imageResponse = await axios.get(result.data.message.imageMessage.url, {
              responseType: 'arraybuffer',
            });
            imageBase64 = Buffer.from(imageResponse.data).toString('base64');
          }

          if (imageBase64) {
            await saveMediaMessage(result.data.key.fromMe, chat.id, timestamp, 'image', imageBase64, schema);
            messageBody = '[imagem recebida]';
          } else {
            throw new Error('Imagem não encontrada ou não processada.');
          }
        } catch (err) {
          console.error('Erro ao processar imagem:', err);
          messageBody = '[erro ao processar imagem]';
        }
      }

      if (!chat || !result.instance) {
        throw new Error('Dados obrigatórios ausentes para createChat');
      }

      const createChats = await createChat(chat, result.instance, result.data.message.conversation, null);
      const chatDb = await getChatService(createChats.chat, createChats.schema);

      const existingMessage = await pool.query(
        `SELECT id FROM ${schema}.messages WHERE id = $1`,
        [result.data.key.id]
      );

      if (existingMessage.rowCount === 0 && !result.data.message?.audioMessage?.base64) {
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
        audioBase64: audioBase64 || null,
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
      console.error('Erro ao enviar áudio:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
};