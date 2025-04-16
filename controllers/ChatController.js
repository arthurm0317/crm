const { setUserChat } = require('../services/ChatService');

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

module.exports = {
    setUserChatController
}