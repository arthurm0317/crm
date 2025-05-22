const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');
const { getChatsInKanbanStage } = require('./KanbanService');
const { sendTextMessage } = require('../requests/evolution');
const { sendBlastMessage } = require('./MessageBlast');
const createRedisConnection = require('../config/Redis');
const { Queue, Worker } = require('bullmq');

const createCampaing = async(campName, sector, kanbanStage, connectionId, schema)=>{
    try {
        const kanban_id = await pool.query(
            `SELECT * FROM ${schema}.kanban_vendas WHERE etapa=$1`, [kanbanStage]
        )
        const result = await pool.query(
            `INSERT INTO ${schema}.campaing (id, campaing_name, sector, kanban_stage, connection_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [uuidv4(), campName, sector, kanban_id.rows[0].id, connectionId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar campanha:', error.message);
        throw error;
    }
}

const startCampaing = async (campaing_id, timer, schema) => {
    try {
      const campaing = await pool.query(
        `SELECT * FROM ${schema}.campaing WHERE id=$1`, [campaing_id]
      );
      const kanban = await pool.query(
        `SELECT * FROM ${schema}.kanban_vendas WHERE id=$1`, [campaing.rows[0].kanban_stage]
      );
  
      const chatId = await getChatsInKanbanStage(kanban.rows[0].etapa, schema);
  
      const messages = await pool.query(
        `SELECT * FROM ${schema}.message_blast WHERE campaing_id=$1`, [campaing_id]
      );
  
      if (messages.rowCount === 0) {
        console.error('Nenhuma mensagem encontrada para a campanha.');
        return;
      }
  
      const messageList = messages.rows;
      let messageIndex = 0;
  
      for (let i = 0; i < chatId.length; i++) {
        const instanceId = await pool.query(
          `SELECT * FROM ${schema}.chats WHERE chat_id=$1`, [chatId[i].chat_id]
        );
  
        const instance = await pool.query(
          `SELECT * FROM ${schema}.connections WHERE id=$1`, [instanceId.rows[0].connection_id]
        );

        const message = messageList[messageIndex];

        messageIndex = (messageIndex + 1) % messageList.length; 
        
        await sendBlastMessage(
            instance.rows[0].name,
            message.value,
            instanceId.rows[0].contact_phone,
            schema
        )
  
        await new Promise((resolve) => setTimeout(resolve, timer * 1000));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.message);
      throw error;
    }
  };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const bullConn = createRedisConnection();

const blastQueue = new Queue("Campanha", { connection: bullConn });

new Worker("Campanha", async (job) => {
  try {
    await sendBlastMessage(
      job.data.instance,
      job.data.message,
      job.data.number,
      job.data.schema
    );
    await sleep(30000)
    console.log('Mensagem enviada com sucesso!');
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err.message);
  }
}, { connection: bullConn });

const startCampaingRedis = async (campaing_id, timer, schema) => {
  try {
    const campaing = await pool.query(
      `SELECT * FROM ${schema}.campaing WHERE id=$1`, [campaing_id]
    );
    const kanban = await pool.query(
      `SELECT * FROM ${schema}.kanban_vendas WHERE id=$1`, [campaing.rows[0].kanban_stage]
    );

    const chatId = await getChatsInKanbanStage(kanban.rows[0].etapa, schema);

    const messages = await pool.query(
      `SELECT * FROM ${schema}.message_blast WHERE campaing_id=$1`, [campaing_id]
    );

    if (messages.rowCount === 0) {
      console.error('Nenhuma mensagem encontrada para a campanha.');
      return;
    }

    const messageList = messages.rows;
    let messageIndex = 0;
    console.log(chatId)
    for (let i = 0; i < chatId.length; i++) {
      const instanceId = await pool.query(
        `SELECT * FROM ${schema}.chats WHERE id=$1`, [chatId[i].id]
      );

      const instance = await pool.query(
        `SELECT * FROM ${schema}.connections WHERE id=$1`, [campaing.rows[0].connection_id]
      );

      const message = messageList[messageIndex];

      messageIndex = (messageIndex + 1) % messageList.length;

      await blastQueue.add('sendMessage', {
        instance: instance.rows[0].name,
        number: instanceId.rows[0].contact_phone,
        message: message.value,
        schema: schema
      }, { delay: timer});
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    createCampaing,
    startCampaing,
    startCampaingRedis
}