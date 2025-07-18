const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');
const { getChatsInKanbanStage } = require('./KanbanService');
const { sendTextMessage, fetchInstanceEvo } = require('../requests/evolution');
const { sendBlastMessage, sendMediaBlastMessage } = require('./MessageBlast');
const createRedisConnection = require('../config/Redis');
const { Queue, Worker } = require('bullmq');
const { saveMessage } = require('./MessageService');
const { Message } = require('../entities/Message');
const { getCurrentTimestamp, parseLocalDateTime } = require('./getCurrentTimestamp');
const { updateChatConnection } = require('./ChatService');
const { fetchInstance } = require('./ConnectionService');

const bullConn = createRedisConnection();
const blastQueue = new Queue("Campanha", { connection: bullConn });

const worker = new Worker(
  'Campanha',
  async (job) => {
    try {
      console.log(`Processando job ${job.id} para número ${job.data.number}`);

      const status = await fetchInstanceEvo()
      
      if(job.data.image){
        await sendMediaBlastMessage(
          job.data.instance,
          job.data.message,
          job.data.number,
          job.data.chat_id,
          job.data.image,
          job.data.schema
        )
      }else{
        await sendBlastMessage(
          job.data.instance,
          job.data.message,
          job.data.number,
          job.data.chat_id,
          job.data.schema
        );
      }
      
      console.log(`Job ${job.id} processado com sucesso`);
    } catch (err) {
      console.error(`Erro ao enviar mensagem dentro do job ${job.id}:`, err.message);
      throw err; 
    }
      },
      {
        connection: bullConn,
        autorun: true,
      }
    );

worker.on('completed', (job) => {
  console.log(` Job ${job.id} concluído com sucesso.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} falhou. Erro:`, err.message);
});

worker.on('error', (err) => {
  console.error('Erro geral no worker:', err.message);
});

const deleteAllConnectionsFromCampaing = async(campaing_id, schema)=>{
  await pool.query(`DELETE FROM ${schema}.campaing_connections where campaing_id=$1`,[campaing_id])
}

const insertConnectionsForCampaing = async(campaing_id, connections, schema)=>{
  for(const connection of connections){
    await pool.query(`INSERT INTO ${schema}.campaing_connections(campaing_id, connection_id) VALUES ($1, $2)`, [campaing_id, connection])
  }
}

const getAllCampaingConnections = async (campaing_id, schema) => {
  const result = await pool.query(`SELECT * FROM ${schema}.campaing_connections WHERE campaing_id=$1`, [campaing_id])
  return result.rows
}

const createCampaing = async (campaing_id, campName, sector, kanbanStage, connectionId, startDate, schema, intervalo) => {
  try {
    const unixStartDate = parseLocalDateTime(startDate);

    // Converter o intervalo para segundos baseado na unidade
    let intervalEmSegundos;
    let intervalMinEmSegundos
    let intervalMaxEmSegundos

    if (intervalo && intervalo.unidade) {
      switch (intervalo.unidade) {
        case 'horas':
          intervalEmSegundos = intervalo.timer * 3600;
          break;
        case 'minutos':
          intervalEmSegundos = intervalo.timer * 60;
          break;
        case 'segundos':
        default:
          intervalEmSegundos = intervalo.timer;
          break;
      }
    } else if(intervalo.min && intervalo.max){
        switch(intervalo.unidade_min){
          case 'horas':
          intervalMinEmSegundos = intervalo.min * 3600;
          break;
        case 'minutos':
          intervalMinEmSegundos = intervalo.min * 60;
          break;
        case 'segundos':
        default:
          intervalMinEmSegundos = intervalo.min;
          break;
        }
        switch(intervalo.unidade_max){
          case 'horas':
          intervalMaxEmSegundos = intervalo.max * 3600;
          break;
        case 'minutos':
          intervalMaxEmSegundos = intervalo.max * 60;
          break;
        case 'segundos':
        default:
          intervalMaxEmSegundos = intervalo.max;
          break;
        }
    }

    let result;
    let campaing;

    if (campaing_id) {
      if(intervalMinEmSegundos){
        result = await pool.query(
        `UPDATE ${schema}.campaing 
         SET campaing_name=$1, sector=$2, kanban_stage=$3, start_date=$4, timer=$5, min=$7, max=$8
         WHERE id=$6  RETURNING *`,
        [campName, sector, kanbanStage, unixStartDate, null, campaing_id, intervalMinEmSegundos, intervalMaxEmSegundos]
      );
      campaing = result.rows[0];
      await deleteAllConnectionsFromCampaing(campaing.id, schema)
      insertConnectionsForCampaing(campaing.id,connectionId, schema)
      }else{
         result = await pool.query(
        `UPDATE ${schema}.campaing 
         SET campaing_name=$1, sector=$2, kanban_stage=$3, start_date=$4, timer=$5
         WHERE id=$6 RETURNING *`,
        [campName, sector, kanbanStage, unixStartDate, intervalEmSegundos, campaing_id]
      );
      campaing = result.rows[0];
      await deleteAllConnectionsFromCampaing(campaing.id, schema)
      insertConnectionsForCampaing(campaing.id,connectionId, schema)
      }
     
    } else {
      if(intervalMinEmSegundos) {
        result = await pool.query(
          `INSERT INTO ${schema}.campaing (id, campaing_name, sector, kanban_stage, start_date, timer, min, max) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [uuidv4(), campName, sector, kanbanStage, unixStartDate, null, intervalMinEmSegundos, intervalMaxEmSegundos]
        );
        campaing = result.rows[0];
        insertConnectionsForCampaing(campaing.id,connectionId, schema)
      } else {
        result = await pool.query(
          `INSERT INTO ${schema}.campaing (id, campaing_name, sector, kanban_stage, start_date, timer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [uuidv4(), campName, sector, kanbanStage, unixStartDate, intervalEmSegundos]
        );
        campaing = result.rows[0];
        insertConnectionsForCampaing(campaing.id,connectionId, schema)
      }
    }
    await scheduleCampaingBlast(campaing, campaing.sector, schema, intervalo);

    return campaing;
  } catch (error) {
    console.error('Erro ao criar/atualizar campanha:', error);
    throw error;
  }
};

const scheduleCampaingBlast = async (campaing, sector, schema, intervalo) => {
  try { 
    const startDate = Number(campaing.start_date);
    const now = Date.now();

    if (startDate < now) {
      console.log('Data de início já passou, não agendando campanha');
      return;
    }

    const kanban = await pool.query(
      `SELECT * FROM ${schema}.kanban_${sector} WHERE id=$1`, [campaing.kanban_stage]
    );
    if (kanban.rowCount === 0) {
      console.error(`Erro: Etapa Kanban com ID ${campaing.kanban_stage} não encontrada para o setor ${sector}.`);
      return; 
    }
    
    const chatIds = await getChatsInKanbanStage(campaing.kanban_stage, schema);
    
    if (!chatIds || chatIds.length === 0) {
      console.log('Nenhum chat encontrado na etapa Kanban');
      return;
    }
    
    const messages = await pool.query(
      `SELECT * FROM ${schema}.message_blast WHERE campaing_id=$1`, [campaing.id]
    );
    if (messages.rowCount === 0) {
      console.error('Nenhuma mensagem encontrada para a campanha.');
      return;
    }
    const messageList = messages.rows;
    
    const baseDelay = Math.max(0, startDate - now);
    
    let intervalEmSegundos;
    if(!campaing.min){
      intervalEmSegundos = Number(campaing.timer) || 30;
    }
    
    const connections = await getAllCampaingConnections(campaing.id, schema);
    if (!connections || connections.length === 0) {
      console.error('Nenhuma conexão encontrada para a campanha.');
      return;
    }

    let jobCount = 0;
    const totalMessages = messageList.length;
    const totalContacts = chatIds.length;
    const totalConnections = connections.length;
    const totalJobs = Math.min(totalMessages * totalConnections, totalContacts); // Limita ao número de contatos disponíveis

    let accumulatedDelay = baseDelay;

    for (let jobIndex = 0; jobIndex < totalJobs; jobIndex++) {
      // Calcula qual mensagem e qual conexão para este job
      const messageIndex = Math.floor(jobIndex / totalConnections);
      const connectionIdx = jobIndex % totalConnections;
      
      // Cada contato é usado apenas uma vez, sequencialmente
      const contactIndex = jobIndex;
      const connection = connections[connectionIdx];
      
      const chat = chatIds[contactIndex];
      const contactPhone = chat.contact_phone;
      const message = messageList[messageIndex];

      if(campaing.min){
        const min = Number(campaing.min);
        const max = Number(campaing.max);
        intervalEmSegundos = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log('interval sorteado:', intervalEmSegundos);
      }

      // Buscar a instância da conexão
      const instance = await pool.query(
        `SELECT * FROM ${schema}.connections WHERE id=$1`, [connection.connection_id]
      );
      if (!instance.rows[0]) {
        console.error('Conexão não encontrada para a campanha');
        continue;
      }
      
      // 1. Procurar chat 'open' para o número NA conexão sorteada
      const openChatQuery = await pool.query(
        `SELECT * FROM ${schema}.chats WHERE contact_phone=$1 AND status='open' AND connection_id=$2 LIMIT 1`,
        [contactPhone, instance.rows[0].id]
      );
      
      let chatToUse = null;
      if (openChatQuery.rowCount > 0) {
        // Chat 'open' pertence à conexão sorteada - usa ele
        chatToUse = openChatQuery.rows[0];
      } else {
        // Não existe chat 'open' na conexão sorteada - procura um 'importado' de qualquer conexão
        const importadoQuery = await pool.query(
          `SELECT * FROM ${schema}.chats WHERE contact_phone=$1 AND status='importado' LIMIT 1`,
          [contactPhone]
        );
        if (importadoQuery.rowCount > 0) {
          // Transfere o chat 'importado' para a conexão sorteada e status 'open'
          const updated = await pool.query(
            `UPDATE ${schema}.chats SET connection_id=$1, status='open' WHERE id=$2 RETURNING *`,
            [instance.rows[0].id, importadoQuery.rows[0].id]
          );
          chatToUse = updated.rows[0];
        } else {
          console.warn(`Nenhum chat 'importado' encontrado para o número ${contactPhone} em nenhuma conexão. Pulando.`);
          continue;
        }
      }
      
      // O delay é calculado por job
      const messageDelay = accumulatedDelay;
      accumulatedDelay += intervalEmSegundos * 1000;
      
      console.log(`Agendando mensagem ${messageIndex + 1}/${totalMessages} para conexão ${connectionIdx + 1}/${connections.length} (contato ${contactPhone}) para:`, new Date(Date.now() + messageDelay).toLocaleString());
      const job = await blastQueue.add('sendMessage', {
        instance: instance.rows[0].id,
        number: contactPhone,
        chat_id: chatToUse.id,
        message: message.value,
        image: message.image,
        schema: schema
      }, { 
        delay: messageDelay, 
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }); 
      console.log(`Job ${job.id} agendado com sucesso, enviando pelo numero ${instance.rows[0].id}, para o ${contactPhone}`);
      jobCount++;
    }
    console.log(`Campanha ${campaing.campaing_name} agendada com ${jobCount} mensagens`);
  } catch (error) {
    console.error('Erro ao agendar disparo da campanha:', error);
    throw error;
  }
};
const startCampaing = async (campaing_id, timer, schema) => {
  try {
    const campaing = await pool.query(
      `SELECT * FROM ${schema}.campaing WHERE id=$1`, [campaing_id]
    );
    
    if (campaing.rowCount === 0) {
      console.error('Campanha não encontrada');
      return;
    }
    
    const kanban = await pool.query(
      `SELECT * FROM ${schema}.kanban_${campaing.rows[0].sector} WHERE id=$1`, [campaing.rows[0].kanban_stage]
    );
    
    if (kanban.rowCount === 0) {
      console.error('Etapa Kanban não encontrada');
      return;
    }
    
    const chatId = await getChatsInKanbanStage(campaing.rows[0].kanban_stage, schema);
    
    if (!chatId || chatId.length === 0) {
      console.log('Nenhum chat encontrado na etapa Kanban');
      return;
    }
    
    const messages = await pool.query(
      `SELECT * FROM ${schema}.message_blast WHERE campaing_id=$1`, [campaing_id]
    );
    if (messages.rowCount === 0) {
      console.error('Nenhuma mensagem encontrada para a campanha.');
      return;
    }
    const messageList = messages.rows;
    let messageIndex = 0;
    
    // Usar o intervalo do banco de dados ou o timer passado como parâmetro
    const intervalEmSegundos = Number(campaing.rows[0].timer) || timer || 30;
    
    console.log(`Iniciando campanha ${campaing.rows[0].campaing_name} com ${chatId.length} chats`);
    
    for (let i = 0; i < chatId.length; i++) {
      const instanceId = await pool.query(
        `SELECT * FROM ${schema}.chats WHERE id=$1`, [chatId[i].id]
      );
      
      if (!instanceId.rows[0] || !instanceId.rows[0].contact_phone) {
        console.warn(`Chat inválido ou número não encontrado para chat ID ${chatId[i].id}`);
        continue;
      }
      
      const instance = await pool.query(
        `SELECT * FROM ${schema}.connections WHERE id=$1`, [instanceId.rows[0].connection_id]
      );
      
      if (!instance.rows[0]) {
        console.warn(`Conexão não encontrada para chat ID ${chatId[i].id}`);
        continue;
      }
      
      const message = messageList[messageIndex];
      messageIndex = (messageIndex + 1) % messageList.length;
      
      console.log(`Enviando mensagem ${i + 1}/${chatId.length} para ${instanceId.rows[0].contact_phone}`);
      
      // Verifica se a mensagem tem imagem
      if (message.image) {
        await sendMediaBlastMessage(
          instance.rows[0].id,
          message.value,
          instanceId.rows[0].contact_phone,
          instanceId.rows[0].id,
          message.image,
          schema
        );
      } else {
        await sendBlastMessage(
          instance.rows[0].id,
          message.value,
          instanceId.rows[0].contact_phone,
          instanceId.rows[0].id,
          schema
        );
      }
      
      if (i < chatId.length - 1) {
        console.log(`Aguardando ${intervalEmSegundos} segundos antes da próxima mensagem`);
        await sleep(intervalEmSegundos * 1000);
      }
    }
    
    console.log('Campanha finalizada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    throw error;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCampaings = async (schema) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${schema}.campaing`
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error.message);
    throw error;
  }
};

const getCampaingById = async (campaing_id, schema) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${schema}.campaing WHERE id=$1`, [campaing_id]
    );
    const connections = await getAllCampaingConnections(campaing_id, schema)
    return{
      result: result.rows[0],
      connections: connections
    };
  } catch (error) {
    console.error('Erro ao buscar campanha por ID:', error.message);
    throw error;
  }
};

const deleteCampaing = async(campaing_id, schema)=>{
  try {
    // Primeiro deleta as mensagens da campanha
    await pool.query(
      `DELETE FROM ${schema}.message_blast WHERE campaing_id=$1`, [campaing_id]
    );
    
    // Depois deleta a campanha
    const result = await pool.query(
      `DELETE FROM ${schema}.campaing WHERE id=$1 RETURNING *`, [campaing_id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao deletar campanha:', error.message);
    throw error;
  }
}


module.exports = {
  createCampaing,
  startCampaing,
  getCampaings,
  getCampaingById,
  deleteCampaing,
  scheduleCampaingBlast
};