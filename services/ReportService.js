const pool = require("../db/queries")
const { v4: uuid4 } = require('uuid');
const { createChatCompletion } = require("./OpenAi");
const { getMessages, getChatData } = require("../utils/getMessages");


const getGptResponse = async (chat_id, schema, status) => {
    const messages = await getMessages(chat_id, schema);
    const gpt_response = await createChatCompletion(messages.map(m => m.body).join('\n'));
    const report = await createReport(chat_id, gpt_response, status, schema)
    return report;
}

const createReport = async(chat_id, gpt_response, status, schema)=>{
    const chatData = await getChatData(chat_id, schema);

    const report = await pool.query(`INSERT INTO ${schema}.reports(id, chat_id, user_id, queue_id, categoria, resumo, assertividade, status, proxima_etapa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, 
        [uuid4(), chatData.chat.id, chatData.chat.assigned_user, chatData.chat.queue_id, gpt_response.categoria, gpt_response.resumo_interacao || 'teste', gpt_response.assertividade_atendimento, status, gpt_response.proxima_etapa_recomendada]
    );
    return report.rows[0];
}

const getReports = async(schema)=>{
    const result = await pool.query(`SELECT * FROM ${schema}.reports`);
    return result.rows;
}

module.exports={
    createReport,
    getGptResponse,
    getReports
}