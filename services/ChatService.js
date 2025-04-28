const pool = require('../db/queries');
const { getOnlineUsers, updateLastAssignedUser, getLastAssignedUser } = require('./UserService');

const createChat = async (chat, schema, message, etapa) => {
  try {
    const existingChat = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE chat_id = $1 AND connection_id = $2`,
      [chat.getChatId(), chat.getConnectionId()]
    );

    if (existingChat.rowCount > 0) {
      await updateChatMessages(chat, schema, message);
      return existingChat.rows[0];
    }
    const contactNumber = chat.getChatId().split('@')[0];
    const contactQuery = await pool.query(
      `SELECT * FROM ${schema}.contacts WHERE number = $1`,
      [contactNumber]
    );

    let contactName;
    if (contactQuery.rowCount > 0) {
      contactName = contactQuery.rows[0].contact_name;
    } else {
      const newContact = await pool.query(
        `INSERT INTO ${schema}.contacts (number, contact_name) VALUES ($1, $2) RETURNING *`,
        [contactNumber, chat.getContact()] 
      );
      contactName = newContact.rows[0].contact_name;
    }

    const chatValues = [
      chat.getId(),
      chat.getChatId(),
      chat.getConnectionId(),
      chat.getQueueId(),
      chat.getIsGroup(),
      contactName,
      chat.getAssignedUser(),
      chat.getStatus(),
      chat.getCreatedAt(),
      JSON.stringify([message]),
      contactNumber,
      etapa || null
    ];

    const query = etapa
      ? `INSERT INTO ${schema}.chats 
          (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages, contact_phone, etapa_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`
      : `INSERT INTO ${schema}.chats 
          (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages, contact_phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

    const result = await pool.query(query, etapa ? chatValues : chatValues.slice(0, -1));

    console.log(`Chat criado com sucesso: ${result.rows[0].id}`);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar chat:', error.message);
    throw new Error('Erro ao criar chat');
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

const getMessages = async(chatId, schema)=>{
    console.log("chatId", chatId, schema)
    const chat_id = await pool.query(
      `SELECT id FROM ${schema}.chats WHERE chat_id=$1`, [chatId])
    console.log("aaaa", chat_id.rows[0])
    const result = await pool.query(
      `SELECT * FROM ${schema}.messages WHERE chat_id=$1 ORDER BY created_at ASC`,
      [chat_id.rows[0].id]
    );
      return result.rows
}

const getChatService = async(chat, schema)=>{
    const result = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE chat_id=$1 AND connection_id=$2`,
      [chat.chat_id, chat.connection_id]
    );
    
    if (result.rows.length > 0) {
      const chat = result.rows[0];
      return chat;
    }
    
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

const getChats = async (schema) => {
    const { rows } = await pool.query(
      `SELECT * FROM ${schema}.chats ORDER BY created_at DESC`
    );
    return rows;
};

const setChatQueue = async(schema, chatId)=>{
  const chatConn = await pool.query(
    `SELECT * FROM ${schema}.chats WHERE chat_id=$1`, [chatId]
  )
  const connQueue = await pool.query(
    `SELECT * FROM ${schema}.connections WHERE id=$1`, [chatConn.rows[0].connection_id]
  )
  if(chatConn.rows[0].queue_id === null){
    console.log("entrou")
    const firstQueue = await pool.query(
      `UPDATE ${schema}.chats SET queue_id=$1 WHERE chat_id=$2`,[connQueue.rows[0].queue_id, chatId]
    )
    return firstQueue.rows[0]
  }
}

const updateQueue = async(schema, chatId, queueId)=>{
  const result = await pool.query(
    `UPDATE ${schema}.chats SET queue_id=$1 WHERE id=$2`,[queueId, chatId]
  )
  return result.rows[0]
}

const getChatData = async(id, schema)=>{
  const chat = await pool.query(
    `SELECT * FROM ${schema}.chats WHERE id=$1`, [id]
  )
  const connection = await pool.query(
    `SELECT * FROM ${schema}.connections WHERE id=$1`, [chat.rows[0].connection_id]
  )
  const queue = await pool.query(
    `SELECT * FROM ${schema}.queues WHERE id=$1`, [chat.rows[0].queue_id]
  )
  const user = await pool.query(
    `SELECT * FROM ${schema}.users WHERE id=$1`, [chat.rows[0].assigned_user]
  )
  const etapa = await pool.query(
    `SELECT * FROM ${schema}.kanban_vendas WHERE id=$1`, [chat.rows[0].etapa_id]
  )
  const result = {
    chat: chat.rows[0],
    connection: connection.rows[0],
    queue: queue.rows[0],
    user: user.rows[0],
    etapa: etapa.rows[0]
  }
  return result
}

module.exports = {
    createChat,
    updateChatMessages,
    getMessages,
    getChatService,
    setUserChat,
    getChats,
    setChatQueue,
    updateQueue,
    getChatData
  }