const express = require('express');
const { Chat } = require('../entities/Chat');
const { v4: uuidv4 } = require('uuid');
const { createChat, getChatService, setChatQueue } = require('../services/ChatService');
const { saveMessage } = require('../services/MessageService');
const { Message } = require('../entities/Message');
const { setQueue } = require('../services/ConnectionService');

const app = express();
app.use(express.json());

module.exports = (io) => {
  app.post('/chat', async (req, res) => {
    const result = req.body;
    const schema = req.body.schema || 'effective_gain';
  
    let contact = result.data.key.remoteJid.split('@')[0];
    try {
      if (result.data.key.fromMe === false) {
        contact = result.data.pushName;
      } else {
        contact = result.data.key.remoteJid.split('@')[0];
      }
  
      let audioBase64 = null;
      if (result.data.messageType === 'audioMessage' && result.data.message.audioMessage) {
        audioBase64 = result.data.message.audioMessage.base64;
        console.log("Áudio em base64:", audioBase64);
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
        new Date(result.date_time).getTime(),
        []
      );
  
      const createChats = await createChat(chat, result.instance, result.data.message.conversation);
      const chatDb = await getChatService(createChats.chat, createChats.schema );

      await saveMessage(
        chatDb.id,
        new Message(
          uuidv4(),
          result.data.message.conversation || audioBase64, 
          result.data.key.fromMe,
          result.data.key.remoteJid,
          result.data.pushName,
          new Date(result.date_time).getTime()
        ),
        createChats.schema
      );
  
      setChatQueue(createChats.schema, chatDb.chat_id);
  
      io.emit("message", {
        chatId: chatDb.id,
        body: result.data.message.conversation || audioBase64, 
        fromMe: result.data.key.fromMe,
        from: result.data.pushName,
        timestamp: new Date(result.date_time).getTime()
      });
  
      res.status(200).json({ result });
    } catch (err) {
      console.error("Erro no webhook /chat:", err);
      res.status(500).json({ error: err.message });
    }
  });
  return app;
};