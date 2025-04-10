const pool = require('../db/queries')

const createChat = async(chat, schema, message)=>{
    const exists = await pool.query(`
        SELECT * FROM ${schema}.chats WHERE number=($1) 
        `, [chat.getNumber()]
    )
    if(exists.rowCount>0){
        updateChatMessages(chat, schema, message)
    }
    else{
    const result = await pool.query(
        `INSERT INTO ${schema}.chats (id, server, number, serialized, fromMe, isGroup, contact, createdAt, messages) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            chat.getId(),
            chat.getServer(),
            chat.getNumber(),
            chat.getSerialized(),
            chat.getFromMe(),
            chat.getIsGroup(),
            chat.getContact(),
            chat.getCreatedAt(),
            JSON.stringify([message])
        ]
    )
    return result.rows[0]
    }
    
}

const updateChatMessages = async (chat, schema, message) => {
    const result = await pool.query(
      `UPDATE ${schema}.chats 
       SET messages = messages || $1::jsonb 
       WHERE number = $2 
       RETURNING *`,
      [JSON.stringify([message]), chat.getNumber()]
    );
    return result.rows[0];
  };

module.exports = {
    createChat,
    updateChatMessages
}