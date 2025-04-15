const pool = require('../db/queries');
const { saveMessage } = require('./MessageService');
const { getOnlineUsers, updateLastAssignedUser, getLastAssignedUser } = require('./UserService');

const createChat = async (chat, schema, message) => {
  const exists = await pool.query(
    `SELECT * FROM ${schema}.chats WHERE chat_id = $1 AND connection_id = $2`,
    [chat.getChatId(), chat.getConnectionId()]
  );

  if (exists.rowCount > 0) {
    await updateChatMessages(chat, schema, message);
  } else {
    await pool.query(
      `INSERT INTO ${schema}.chats 
        (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
  }
};

const updateChatMessages = async (chat, schema, message) => {
    console.log(chat.getId())
    const result = await pool.query(
      `UPDATE ${schema}.chats 
       SET messages = messages || $1::jsonb 
       WHERE chat_id = $2 
       RETURNING *`,
      [JSON.stringify([message]), chat.getChatId()]
    );
    return result.rows[0];
  };

  const getMessages = async(chat, schema, connectionId)=>{
      const result = await pool.query(
        `SELECT * FROM ${schema}.chats WHERE chat_id=$1 AND connection_id=$2`,[chat.getChatId(), connectionId]
      )
      return result.rows[0].messages
  }

  const getChatService = async(chat, schema)=>{
    const result = await pool.query(
        `SELECT * FROM ${schema}.chats WHERE chat_id=$1 AND connection_id=$2`,[chat.getChatId(), chat.getConnectionId()]
    )
    return result.rows[0]

  }

  const setUserChat = async (chatId, schema) => {
    const chatDb = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE id=$1`,
      [chatId]
    );
    const queueId = chatDb.rows[0].queue_id;
  
    const onlineUsers = await getOnlineUsers(schema);

    const queueUsersQuery = await pool.query(
      `SELECT user_id FROM ${schema}.queue_users WHERE queue_id=$1`,
      [queueId]
    );
  
    
    const userIdsInQueue = queueUsersQuery.rows.map(row => row.user_id);

    const eligibleUsers = onlineUsers.filter(user =>
      user.permission === 'user' && userIdsInQueue.includes(user.id)
    );
    if (eligibleUsers.length === 0) {
      console.log('Nenhum atendente disponível na fila:', queueId);
      return;
    }
    console.log("elegible", eligibleUsers)
    const lastAssigned = await getLastAssignedUser(queueId);
    let nextUser;
    console.log("last", lastAssigned)
    if (!lastAssigned) {
      nextUser = eligibleUsers[0];
    } else {
      const lastIndex = eligibleUsers.findIndex(u => u.id === lastAssigned.user_id);
      nextUser = eligibleUsers[(lastIndex + 1) % eligibleUsers.length];
    }
  
    await updateLastAssignedUser(queueId, nextUser.id);
  
    await pool.query(
      `UPDATE ${schema}.chats SET assigned_user=$1 WHERE id=$2`,
      [nextUser.id, chatId]
    );
  
    console.log(`Chat atribuído ao usuário ${nextUser.name}`);
  };
  
module.exports = {
    createChat,
    updateChatMessages,
    getMessages,
    getChatService,
    setUserChat
  }