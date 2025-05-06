const { setUserChat, getChats, getMessages, getChatData, getChatByUser, updateQueue, getChatById, saveMediaMessage } = require('../services/ChatService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../db/queries');
const axios = require('axios'); 

const { sendAudioToWhatsApp } = require('../requests/evolution');
const { searchConnById } = require('../services/ConnectionService');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const audioFolder = path.join(__dirname, '..', 'uploads', 'audios');
    if (!fs.existsSync(audioFolder)) {
      fs.mkdirSync(audioFolder, { recursive: true });
    }
    cb(null, audioFolder);
  },
  filename: (req, file, cb) => {
    console.log('Recebendo arquivo:', file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const setUserChatController = async (req, res) => {
  const { chat } = req.body;

  try {
    const schema = req.body.schema || 'effective_gain';
    const result = await setUserChat(chat, schema);

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      erro: 'Não foi distribuir o chat',
    });
  }
};

const getChatsController = async (req, res) => {
  try {
    const schema = req.params?.schema || 'effective_gain';
    const result = await getChats(schema);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      erro: 'Não foi recuperar os chats',
    });
  }
};

const getMessagesController = async (req, res) => {
  const { chat_id, schema } = req.body;
  try {
    const result = await getMessages(chat_id, schema);
    res.json({ messages: result });
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateQueueController = async (req, res) => {
  try {
    const { queueId, chatId } = req.body;
    const schema = req.body.schema || 'effective_gain';

    const result = await updateQueue(schema, chatId, queueId);
    res.json({ messages: result });
  } catch (err) {
    console.error('Erro ao definir fila do chat:', err);
    res.status(500).json({ error: err.message });
  }
};

const getChatDataController = async (req, res) => {
  const { schema, chatId } = req.params;

  if (!chatId || !schema) {
    return res.status(400).json({ error: 'Os parâmetros schema e chatId são obrigatórios.' });
  }

  try {
    const result = await getChatData(chatId, schema);
    res.status(200).json({ messages: result });
  } catch (err) {
    console.error('Erro ao buscar dados do chat:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados do chat.' });
  }
};

const getChatByUserController = async (req, res) => {
  const { userId } = req.params;
  const schema = req.params.schema || 'effective_gain';

  if (!userId) {
    return res.status(400).json({ error: 'O parâmetro userId é obrigatório.' });
  }

  try {
    const result = await getChatByUser(userId, schema);
    res.status(200).json({ messages: result });
  } catch (err) {
    console.error('Erro ao buscar chats do usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar chats do usuário.' });
  }
};

const sendAudioController = async (req, res) => {
  const { chatId, connectionId, schema } = req.body;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const audioPath = path.join(__dirname, '..', 'uploads', 'audios', audioFile.filename);

  try {
    if (!fs.existsSync(audioPath)) {
      throw new Error('O arquivo de áudio não foi salvo corretamente.');
    }

    const stats = fs.statSync(audioPath);
    console.log('Tamanho do arquivo recebido:', stats.size);

    if (stats.size === 0) {
      throw new Error('O arquivo de áudio está vazio.');
    }

    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');
    console.log('Tamanho do áudio base64:', audioBase64.length);

    if (audioBase64.length === 0) {
      throw new Error('Falha ao converter o áudio para base64.');
    }

    await saveMediaMessage('true', chatId, new Date().getTime(), 'audio', audioBase64, schema);

    const chat_id = await getChatById(chatId, connectionId, schema);
    const instanceId = await searchConnById(connectionId, schema);
    console.log('instanceId:', instanceId);

    const evolutionResponse = await sendAudioToWhatsApp(chat_id.contact_phone, audioBase64, instanceId.name);

    res.status(200).json({ success: true, message: 'Áudio processado e enviado com sucesso', evolutionResponse });
  } catch (error) {
    console.error('Erro ao processar áudio:', error.message);
    res.status(500).json({ error: 'Erro ao processar áudio' });
  } finally {
    setTimeout(() => {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log('Arquivo de áudio excluído:', audioPath);
      }
    }, 500);
  }
}
module.exports = {
  setUserChatController,
  getChatsController,
  getMessagesController,
  updateQueueController,
  getChatDataController,
  getChatByUserController,
  sendAudioController,
  upload,
};