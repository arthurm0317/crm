const pool = require('../db/queries')

const createChat = async(chat, schema, message)=>{
    const exists = await pool.query(`
        SELECT * FROM ${schema}.chats WHERE chat_id=($1) 
        `, [chat.getChatId()]
    )
    if(exists.rowCount>0){
        updateChatMessages(chat, schema, message)
    }
    else{
    const result = await pool.query(
        `INSERT INTO ${schema}.chats (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)`,
        [
            chat.getId(),            
            chat.getChatId(),
            chat.getConnectionId(),
            chat.getQueueId(),
            chat.getIsGroup(),
            chat.getContact(),       
            chat.getAssignedUser(),
            chat.getStatus(),
            chat.getCreatedAt(),
            JSON.stringify([message]) 
          ]
        );
    return result.rows[0]
    }
    
}

const updateChatMessages = async (chat, schema, message) => {
    console.log(chat.getChatId())
    const result = await pool.query(
      `UPDATE ${schema}.chats 
       SET messages = messages || $1::jsonb 
       WHERE chat_id = $2 
       RETURNING *`,
      [JSON.stringify([message]), chat.getChatId()]
    );
    return result.rows[0];
  };

module.exports = {
    createChat,
    updateChatMessages
}