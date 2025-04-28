const { setUserChat, getChats, getMessages, setQueue, getChatData } = require('../services/ChatService');

const setUserChatController = async(req, res)=>{
    const {chat} = req.body
    
    try{
        const schema = req.body.schema || 'effective_gain'
        const result = await setUserChat(chat, schema)

        res.status(201).json(result)
    }catch(error){
        console.log(error)
        res.status(500).json({
            erro: "Não foi distribuir o chat"
        })
    }
}

const getChatsController = async(req, res)=>{
    try{
        const schema = req.params?.schema || 'effective_gain'
        const result = await getChats(schema)
        res.status(201).json(result)
    }catch(error){
        console.log(error)
        res.status(500).json({
            erro: "Não foi recuperar os chats"
        })
    }
}

const getMessagesController = async(req, res)=>{
    const { chatId, schema } = req.body;
    console.log("MESSAGE CONTORLLER", chatId, schema)
  try {
    const result = await getMessages(chatId, schema);
    res.json({ messages: result });
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: err.message });
  }
}

const setQueueController = async(req, res)=>{
    try{
        const {queueId, chatId} = req.body
        const schema = req.body.schema || 'effective_gain'

        const result = await setQueue(schema, chatId, queueId)
        res.json({ messages: result });
    } catch (err) {
      console.error('Erro ao definir fila do chat:', err);
      res.status(500).json({ error: err.message });
    }
}
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

module.exports = {
    setUserChatController,
    getChatsController,
    getMessagesController,
    setQueueController,
    getChatDataController
}