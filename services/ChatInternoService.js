// services/ChatInternoService.js
const pool = require('../db/queries');

async function getUsers(currentUserId, schema) {
  if (!schema) {
    throw new Error('Schema é obrigatório');
  }
  
  const result = await pool.query(`SELECT id, name FROM ${schema}.users WHERE id != $1`, [currentUserId]);
  return result.rows;
}

async function getOrCreateChat(user1_id, user2_id, schema) {
  const result = await pool.query(
    `SELECT internal_chat_id FROM ${schema}.internal_chat
     WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
    [user1_id, user2_id]
  );
  if (result.rows.length > 0) return result.rows[0].internal_chat_id;

  const { v4: uuidv4 } = require('uuid');
  const newId = uuidv4();
  await pool.query(
    `INSERT INTO ${schema}.internal_chat (internal_chat_id, user1_id, user2_id)
     VALUES ($1, $2, $3)`,
    [newId, user1_id, user2_id]
  );
  return newId;
}


async function getMessages(user1, user2, schema) {
  const chat_id = await getOrCreateChat(user1, user2, schema);
  const result = await pool.query(
    `SELECT * FROM ${schema}.internal_messages
     WHERE chat_id = $1
     ORDER BY created_at ASC`,
    [chat_id]
  );
  return result.rows;
}

async function saveMessage(sender_id, receiver_id, message, schema) {
  const chat_id = await getOrCreateChat(sender_id, receiver_id, schema);
  
  const result = await pool.query(
    `INSERT INTO ${schema}.internal_messages (chat_id, sender_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [chat_id, sender_id, message]
  );
  
  return result.rows[0];
}

module.exports = {
  getUsers,
  getMessages,
  saveMessage
};