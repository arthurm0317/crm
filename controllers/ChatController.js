const { setUserChat, getChats, getMessages, getChatData, getChatByUser, updateQueue } = require('../services/ChatService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../db/queries');
const axios = require('axios'); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const audioFolder = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(audioFolder)) {
      fs.mkdirSync(audioFolder, { recursive: true });
    }
    cb(null, audioFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


const sendAudioToWhatsApp = async (chatId, audioBase64) => {
  try {
    const response = await axios.post('https://api.evolution.com/sendAudio', { 
      chatId,
      audio: audioBase64,
    });

    console.log('Áudio enviado para o WhatsApp com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar áudio para o WhatsApp:', error);
    throw error;
  }
};

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
  const { chatId, schema } = req.body;
  try {
    const result = await getMessages(chatId, schema);
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
  const { chatId, schema } = req.body;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {

    const audioPath = path.join(__dirname, '..', 'uploads', audioFile.filename);
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');

    //espaço pra salvar no banco
    await pool.query(
      //chatId e audioBase64
    );

    console.log('Áudio salvo no banco de dados com sucesso');

    const evolutionResponse = await sendAudioToWhatsApp(chatId, audioBase64);

    res.status(200).json({ success: true, message: 'Áudio processado e enviado com sucesso', evolutionResponse });
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    res.status(500).json({ error: 'Erro ao processar áudio' });
  } finally {
    const audioPath = path.join(__dirname, '..', 'uploads', audioFile.filename);
    fs.unlinkSync(audioPath);
  }
};

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