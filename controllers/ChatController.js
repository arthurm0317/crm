const { setUserChat, getChats, getMessages, setQueue } = require('../services/ChatService');

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
    console.log(chatId, schema)
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
module.exports = {
    setUserChatController,
    getChatsController,
    getMessagesController,
    setQueueController
}