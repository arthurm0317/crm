const { v4: uuidv4 } = require('uuid');
const pool = require("../db/queries");
const { sendTextMessage } = require('../requests/evolution');
const { getInformationFromExcel, processExcelFile } = require('./ExcelReader');
const { getChatsInKanbanStage } = require('./KanbanService');

const createMessageForBlast = async (messageValue, sector, schema) => {
  try {
    const result = await pool.query(
      `INSERT INTO ${schema}.message_blast (id, value, sector) VALUES ($1, $2, $3) RETURNING *`,
      [uuidv4(), messageValue, sector]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar mensagem:', error.message);
    throw error;
  }
}


const messageBlast = async(messageId, chatId, schema)=>{
    try{
        const instanceId = await pool.query(
        `SELECT * FROM ${schema}.chats where chat_id=$1`, [chatId[0].chat_id]
        )
        const instance = await pool.query(
        `SELECT * FROM ${schema}.connections where id=$1`, [instanceId.rows[0].connection_id]
        )
        const message = await pool.query(
        `SELECT * FROM ${schema}.message_blast where id=$1`, [messageId]
        )
        
        const result = await sendTextMessage(
            instance.rows[0].name,
            message.rows[0].value,
            instanceId.rows[0].contact_phone
          );
        console.log("Resultado do envio:", result)
    }catch(error){
        console.error('Erro ao enviar mensagem:', error.message);
        throw error;
    }
}

const initiateBlast = async (messageId, schema) => {
  try{
    const data = await processExcelFile()
    for (let i = 0; i < data.length; i++) {
        const chatId = await getChatsInKanbanStage('Regua 4', schema)
        const blast = await messageBlast(messageId, chatId, schema)
        return blast
    }
  }
    catch(error){
        console.error('Erro ao iniciar disparo:', error.message);
        throw error;
    }
};

module.exports = {
  createMessageForBlast,
  messageBlast,
  initiateBlast
};