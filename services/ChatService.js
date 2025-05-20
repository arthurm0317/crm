const pool = require('../db/queries');
const { v4: uuid4 } = require('uuid');
const { getOnlineUsers, updateLastAssignedUser, getLastAssignedUser } = require('./UserService');
const { getCurrentTimestamp } = require('./getCurrentTimestamp');

const createChat = async (chat, instance, message, etapa, io) => {
  let schema;

  const geralSchema = await pool.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'public')`
  );
  const schemaNames = geralSchema.rows.map(row => row.schema_name);

  for (const schemas of schemaNames) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schemas}.connections WHERE name=$1`, [instance]
      );
      if (result.rows.length > 0) {
        schema = schemas;
        break;
      }
    } catch (error) {
      console.error("Erro ao buscar conexão:", error.message);
    }
  }

  if (!schema) {
    throw new Error("Schema não encontrado para a instância fornecida.");
  }

  try {
    const existingChat = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE chat_id = $1 AND connection_id = $2`,
      [chat.getChatId(), chat.getConnectionId()]
    );

    if (existingChat.rowCount > 0) {
      const updated = await updateChatMessages(chat, schema, message);
      if(existingChat.rows[0].queue_id===null){
            await setChatQueue(schema, existingChat.rows[0].id)
          }
      return {
        chat: existingChat.rows[0],
        schema: schema
      };
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
      etapa || null,
      getCurrentTimestamp
    ];

    const query = etapa
      ? `INSERT INTO ${schema}.chats 
          (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages, contact_phone, etapa_id, updated_time) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`
      : `INSERT INTO ${schema}.chats 
          (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages, contact_phone, updated_time) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;


    const result = await pool.query(query, etapa ? chatValues : chatValues.slice(0, -1));
    console.log('TESTE',result.rows[0])
         if(result.rows[0].queue_id===null){
            await setChatQueue(schema, result.rows[0].id)
          }

    if (io) {
      io.to(schema).emit("chat:new-message", {
        chatId: chat.getChatId(),
        message,
        schema
      });
    }
    return {
      chat: result.rows[0],
      schema: schema
    };
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    throw new Error('Erro ao criar chat');
  }
};

const updateChatMessages = async (chat, schema, message) => {
  try {
    const result = await pool.query(
      `UPDATE ${schema}.chats 
       SET messages = messages || $1::jsonb, updated_time=$2
       WHERE chat_id = $3 
       RETURNING *`,
      [JSON.stringify([message]), getCurrentTimestamp(), chat.getChatId()]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar mensagens do chat:', error.message);
    throw new Error('Erro ao atualizar mensagens do chat');
  }
};

const getMessages = async(chat_Id, schema)=>{
    const result = await pool.query(
      `SELECT * FROM ${schema}.messages WHERE chat_id=$1 ORDER BY created_at ASC`,
      [chat_Id]
    );
    return result.rows
}

const getChatService = async(chat_id, connection_id, schema)=>{
    const result = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE id=$1 AND connection_id=$2`,
      [chat_id, connection_id]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
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
    if (eligibleUsers.length === 0) return;
    const lastAssigned = await getLastAssignedUser(queueId, schema);
    let nextUser;
    if (!lastAssigned) {
      nextUser = eligibleUsers[0];
    } else {
      const lastIndex = eligibleUsers.findIndex(u => u.id === lastAssigned.user_id);
      nextUser = eligibleUsers[(lastIndex + 1) % eligibleUsers.length];
    }
    await updateLastAssignedUser(queueId, nextUser.id, schema);
   const result =  await pool.query(
      `UPDATE ${schema}.chats SET assigned_user=$1 WHERE id=$2`,
      [nextUser.id, chatId]
    );
    return result
};

const getChats = async (schema) => {
    const { rows } = await pool.query(
      `SELECT * FROM ${schema}.chats ORDER BY created_at ASC`
    );
    return rows;
};

const setChatQueue = async(schema, chatId)=>{
  const chatConn = await pool.query(
    `SELECT * FROM ${schema}.chats WHERE id=$1`, [chatId]
  )
  const connQueue = await pool.query(
    `SELECT * FROM ${schema}.connections WHERE id=$1`, [chatConn.rows[0].connection_id]
  )
  if(chatConn.rows[0].queue_id === null){
    const firstQueue = await pool.query(
      `UPDATE ${schema}.chats SET queue_id=$1 WHERE id=$2`,[connQueue.rows[0].queue_id, chatId]
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
  return {
    chat: chat.rows[0],
    connection: connection.rows[0],
    queue: queue.rows[0],
    user: user.rows[0],
    etapa: etapa.rows[0]
  }
}

const getChatByUser = async (userId, schema) => {
  console.log('entrou getBYUser')
  try {
    const result = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE assigned_user = $1 ORDER BY updated_time desc`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar chats do usuário:', error.message);
    throw new Error('Erro ao buscar chats do usuário');
  }
};

const getChatById = async (chatId, connection_id, schema) => {
  try {
    console.log("chatId", chatId)
    console.log("connection_id", connection_id) 
      
    const result = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE id = $1 and connection_id = $2`,
      [chatId, connection_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar chat pelo ID:', error.message);
    throw new Error('Erro ao buscar chat pelo ID');
  }
}
const saveMediaMessage = async (id,fromMe, chat_id, createdAt, message_type, audioBase64, schema) => {
  try {
    const result = await pool.query(
      `INSERT INTO ${schema}.messages (id, from_me, chat_id, created_at, message_type, base64) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, fromMe, chat_id, createdAt, message_type, audioBase64]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao salvar mensagem de áudio:', error.message);
    throw new Error('Erro ao salvar mensagem de áudio');
  }
};

const createNewChat = async(name, number, connectionId, queueId, user_id, schema) => {
  try {
    const result = await pool.query(
      `INSERT INTO ${schema}.chats (id, chat_id, connection_id, queue_id, isGroup, contact_name, assigned_user, status, created_at, messages) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [uuid4(), number + '@c.us', connectionId, queueId, false, name, user_id, 'open', new Date().getTime(), JSON.stringify([])]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar novo chat:', error.message);
    throw new Error('Erro ao criar novo chat');
  }
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
  getChatData,
  getChatByUser,
  saveMediaMessage,
  getChatById,
  createNewChat
};
