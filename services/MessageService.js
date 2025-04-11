const pool = require('../db/queries')

const saveMessage = async(chatId, message, schema)=>{
    const result = await pool.query(
        `INSERT INTO ${schema}.messages(id, body, from_me, chat_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,[
            message.getId(),
            message.getMessage(),
            message.getFromMe(),
            chatId,
            message.getCreatedAt()
        ]
    )
    return result.rows[0]
}
module.exports ={
    saveMessage
}