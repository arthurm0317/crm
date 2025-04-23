const express = require('express');
const { Chat } = require('../entities/Chat');
const { v4: uuidv4 } = require('uuid');
const { createChat, getChatService } = require('../services/ChatService');
const { saveMessage } = require('../services/MessageService');
const { Message } = require('../entities/Message');

const app = express();
app.use(express.json());

module.exports = (io) => {
  app.post('/chat', async (req, res) => {
    const result = req.body;

    try {
      const chat = new Chat(
        uuidv4(),
        result.data.key.remoteJid,
        result.data.instanceId,
        null,
        false,
        null,
        null,
        result.data.status,
        new Date(result.date_time).getTime(),
        []
      );

      const createChats = await createChat(chat, 'effective_gain', result.data.message.conversation);
      const chatDb = await getChatService(createChats, 'effective_gain');
      await saveMessage(
        chatDb.id,
        new Message(
          uuidv4(),
          result.data.message.conversation,
          result.data.key.fromMe,
          result.data.key.remoteJid,
          result.data.pushName,
          new Date(result.date_time).getTime()
        ),
        'effective_gain'
      );

      io.emit("message", {
        chatId: chatDb.id,
        body: result.data.message.conversation,
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