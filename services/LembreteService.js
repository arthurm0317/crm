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
    console.log('Lembrete disparado:', job.data);
    SocketServer.io.emit('lembrete', job.data);
}, { connection: redisConnection });

const agendarLembrete = async (lembrete) => {
    await lembreteQueue.add('notificar', lembrete, {
    jobId: lembrete.id, // importante para remover depois
    delay: Math.max(0, lembrete.date * 1000 - Date.now()),
    removeOnComplete: true,
    removeOnFail: true,
});
};

const createLembrete = async (lembrete_name, tag, message, date, schema) => {
    try {
        const result = await pool.query(
            `INSERT INTO ${schema}.lembretes(id, lembrete_name, tag, message, date) VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [uuidv4(), lembrete_name, tag, message, date]
        );
        await agendarLembrete({
            id: result.rows[0].id,
            lembrete_name,
            tag,
            message,
            date,
            schema
        });
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getLembretes = async (schema) => {
    const result = await pool.query(
        `SELECT * FROM ${schema}.lembretes`
    )
    return result.rows
}

const updateLembretes = async (id, lembrete_name, tag, message, date, icone, schema) => {
    const result = await pool.query(
        `UPDATE ${schema}.lembretes SET lembrete_name=$1, tag=$2, message=$3, date=$4, icone=$5 WHERE id=$6 RETURNING *`,
        [lembrete_name, tag, message, date, icone, id]
    );
    await agendarLembrete({
        id,
        lembrete_name,
        tag,
        message,
        date,
        icone,
        schema
    });
    return result.rows;
};

const deleteLembrete = async (id, schema) => {
    const result = await pool.query(`DELETE FROM ${schema}.lembretes where id=$1`,[id])
    await lembreteQueue.remove(id);
}

module.exports={
    createLembrete,
    getLembretes,
    updateLembretes,
    deleteLembrete
}