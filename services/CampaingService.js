const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');
const { getChatsInKanbanStage } = require('./KanbanService');
const { sendTextMessage } = require('../requests/evolution');

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

const startCampaing = async(campaing_id, timer, schema)=>{
    try{
        const campaing = await pool.query(
            `SELECT * FROM ${schema}.campaing WHERE id=$1`, [campaing_id]
        )
        const kanban = await pool.query(
            `SELECT * FROM ${schema}.kanban_vendas WHERE id=$1`, [campaing.rows[0].kanban_stage]
        )
        console.log("kanban", kanban.rows[0])
        const chatId = await getChatsInKanbanStage(kanban.rows[0].etapa, schema)
        for (let i = 0; i < chatId.length; i++) {
            const instanceId = await pool.query(
            `SELECT * FROM ${schema}.chats where chat_id=$1`, [chatId[i].chat_id]
            )
            console.log("instanceId", instanceId.rows[0])
            const instance = await pool.query(
            `SELECT * FROM ${schema}.connections where id=$1`, [instanceId.rows[0].connection_id]
            )
            const message = await pool.query(
            `SELECT * FROM ${schema}.message_blast where campaing_id=$1`, [campaing_id]
            )
            await sendTextMessage(
                instance.rows[0].name,
                message.rows[0].value,
                instanceId.rows[0].contact_phone
            );
            await new Promise((resolve) => setTimeout(resolve, timer * 1000));
        }
        
    }catch(error){
        console.error('Erro ao enviar mensagem:', error.message);
        throw error;
    }
}


module.exports = {
    createCampaing,
    startCampaing
}