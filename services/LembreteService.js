const { v4: uuidv4 } = require('uuid');
const pool = require('../db/queries');
const { Queue, Worker } = require('bullmq'); // Remova QueueScheduler daqui
const IORedis = require('ioredis');
const createRedisConnection = require('../config/Redis');
const SocketServer = require('../server');


const redisConnection = createRedisConnection();

const io = SocketServer.io

const lembreteQueue = new Queue('lembretes', { connection: redisConnection });

const lembreteWorker = new Worker('lembretes', async job => {
    const { tag, filas } = job.data;
    if(tag==='geral'){
        SocketServer.io.emit('lembrete', job.data);
    }else if(tag==='setorial' && filas && filas.length > 0){
        filas.forEach(filaId => {
            SocketServer.io.to(`fila_${filaId}`).emit('lembrete', job.data);
        });
    }else if(tag==='pessoal'){
        SocketServer.io.to(`user_${job.data.user_id}`).emit('lembrete', job.data);
    }
}, { connection: redisConnection });

const agendarLembrete = async (lembrete) => {
    await lembreteQueue.add('notificar', lembrete, {
    jobId: lembrete.id, 
    user: lembrete.user_id,
    delay: Math.max(0, lembrete.date * 1000 - Date.now()),
    removeOnComplete: true,
    removeOnFail: true,
});
};

const salvarFilasLembrete = async (lembreteId, filas, schema) => {
    if (!filas || filas.length === 0) return;
    
    await pool.query(
        `DELETE FROM ${schema}.lembretes_queues WHERE lembrete_id = $1`,
        [lembreteId]
    );
    
    for (const filaId of filas) {
        await pool.query(
            `INSERT INTO ${schema}.lembretes_queues(lembrete_id, queue_id) VALUES($1, $2)`,
            [lembreteId, filaId]
        );
    }
};

const buscarFilasLembrete = async (lembreteId, schema) => {
    const result = await pool.query(
        `SELECT queue_id FROM ${schema}.lembretes_queues WHERE lembrete_id = $1`,
        [lembreteId]
    );
    return result.rows.map(row => row.queue_id);
};

const createLembrete = async (lembrete_name, tag, message, date, icone, user_id, schema, filas = []) => {
    try {
        const lembreteId = uuidv4();
        const result = await pool.query(
            `INSERT INTO ${schema}.lembretes(id, lembrete_name, tag, message, date, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            [lembreteId, lembrete_name, tag, message, date, user_id]
        );
        
        if (tag === 'setorial' && filas && filas.length > 0) {
            await salvarFilasLembrete(lembreteId, filas, schema);
        }
        
        await agendarLembrete({
            id: lembreteId,
            lembrete_name,
            tag,
            message,
            date,
            user_id,
            schema,
            filas
        });
        
        // Retorna o lembrete com as filas
        const lembreteComFilas = {
            ...result.rows[0],
            filas: tag === 'setorial' ? filas : []
        };
        
        return lembreteComFilas;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getLembretes = async (schema) => {
    try {
        const result = await pool.query(
            `SELECT * FROM ${schema}.lembretes ORDER BY date ASC`
        );
        
        const lembretesComFilas = await Promise.all(
            result.rows.map(async (lembrete) => {
                if (lembrete.tag === 'setorial') {
                    const filas = await buscarFilasLembrete(lembrete.id, schema);
                    return { ...lembrete, filas };
                }
                return { ...lembrete, filas: [] };
            })
        );
        
        return lembretesComFilas;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateLembretes = async (id, lembrete_name, tag, message, date, icone, schema, filas = []) => {
    try {
        const result = await pool.query(
            `UPDATE ${schema}.lembretes SET lembrete_name=$1, tag=$2, message=$3, date=$4 WHERE id=$5 RETURNING *`,
            [lembrete_name, tag, message, date, id]
        );
        
        // Atualiza as filas se for setorial
        if (tag === 'setorial') {
            await salvarFilasLembrete(id, filas, schema);
        } else {
            // Remove todas as filas se não for setorial
            await pool.query(
                `DELETE FROM ${schema}.lembretes_queues WHERE lembrete_id = $1`,
                [id]
            );
        }
        
        await agendarLembrete({
            id,
            lembrete_name,
            tag,
            message,
            date,
            icone,
            schema,
            filas: tag === 'setorial' ? filas : []
        });
        
        // Retorna o lembrete atualizado com as filas
        const lembreteAtualizado = {
            ...result.rows[0],
            filas: tag === 'setorial' ? filas : []
        };
        
        return lembreteAtualizado;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteLembrete = async (id, schema) => {
    try {
        // Remove as relações com filas primeiro
        await pool.query(
            `DELETE FROM ${schema}.lembretes_queues WHERE lembrete_id = $1`,
            [id]
        );
        
        // Remove o lembrete
        const result = await pool.query(`DELETE FROM ${schema}.lembretes where id=$1 RETURNING *`, [id]);
        
        // Remove o job da fila
        await lembreteQueue.remove(id);
        
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports={
    createLembrete,
    getLembretes,
    updateLembretes,
    deleteLembrete
}