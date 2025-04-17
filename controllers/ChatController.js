const { setUserChat, getChats, getMessages } = require('../services/ChatService');

const setUserChatController = async(req, res)=>{
    const {chat} = req.body
    
    try{
        const schema = req.body.schema || 'crm'
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
        const schema = req.params?.schema || 'crm'
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
    const { chatId, connectionId, schema } = req.body;

  try {
    const result = await getMessages(chatId, schema, connectionId);
    res.json({ messages: result });
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
    setUserChatController,
    getChatsController,
    getMessagesController
}