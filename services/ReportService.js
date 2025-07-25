const pool = require("../db/queries")
const { getChatById, getMessages, getChatData } = require("./ChatService")
const { v4: uuid4 } = require('uuid');
const { createChatCompletion } = require("./OpenAi");


const getGptResponse = async (chat_id, schema) => {
    const messages = await getMessages(chat_id, schema);
    const gpt_response = await createChatCompletion(messages.map(m => m.body).join('\n'));
    return gpt_response;
}

const createReport = async(chat_id, gpt_response, schema)=>{
    console.log('Criando relatório para o chat:', chat_id, 'com resposta:', gpt_response);
    const chatData = await getChatData(chat_id, schema);

    const report = await pool.query(`INSERT INTO ${schema}.reports(id, chat_id, user_id, queue_id, categoria, resumo, assertividade, status, proxima_etapa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, 
        [uuid4(), chatData.chat.id, chatData.chat.assigned_user, chatData.chat.queue_id, gpt_response.categoria, gpt_response.resumo_interacao || 'teste', gpt_response.assertividade_atendimento, '8fe374ac-1cfa-4aa0-896f-3f8d74eb88fe', gpt_response.proxima_etapa_recomendada]
    );
}

module.exports={
    createReport,
    getGptResponse
}