const pool = require('../db/queries')
const { Message } = require('../entities/Message'); 

const saveMessage = async (chatId, message, schema) => {
    if (!(message instanceof Message)) {
        message = new Message(
            message.id,
            message.body || message.message,
            message.from_me ?? true,
            chatId,
            message.created_at || message.createdAt || message.timestamp
        );
    }

    let createdAt = message.getCreatedAt();
    if (typeof createdAt === 'number' && createdAt < 20000000000) {
        createdAt = createdAt * 1000;
    }

    const result = await pool.query(
        `INSERT INTO ${schema}.messages(id, body, from_me, chat_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
            message.getId(),
            message.getMessage(),
            message.getFromMe(),
            chatId,
            createdAt
        ]
    );
    return result.rows[0];
};
module.exports ={
    saveMessage
}