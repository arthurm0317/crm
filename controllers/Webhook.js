const express = require('express');
const { Chat } = require('../entities/Chat');
const app = express();
const { v4: uuidv4 } = require('uuid');
const { createChat, getChatService } = require('../services/ChatService');
const { saveMessage } = require('../services/MessageService');
const { Message } = require('../entities/Message');

app.use(express.json());

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

    res.status(200).json({ result });

  } catch (err) {
    console.error("Erro no webhook /chat:", err);
    res.status(500).json({ error: err.message });
  }
});



const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Webhook ouvindo na porta ${PORT}`);
});
