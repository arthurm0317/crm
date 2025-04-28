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
    console.log(result)
    try {
      if(result.data.key.fromMe === false){
        contact = result.data.pushName
    }else{
        contact=result.data.key.remoteJid.split('@')[0]
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
    console.log("chat", chat) 
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
      setChatQueue(schema, chatDb.chat_id);

      console.log('Emitindo mensagem:', {
        chatId: chatDb.id,
        body: result.data.message.conversation,
        fromMe: result.data.key.fromMe,
        from: result.data.pushName,
        timestamp: new Date(result.date_time).getTime()
      });
      io.emit("message", {
        chatId: chatDb.id,
        body: result.data.message.conversation,
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