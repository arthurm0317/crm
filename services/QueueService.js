const pool = require('../db/queries')

const createQueue=async(queue, schema)=>{
    const result = await pool.query(
        `INSERT INTO ${schema}.queues (id, name, color, users) VALUES ($1, $2, $3, $4)`,
        [
            queue.getId(),
            queue.getName(),
            queue.getColor(),
            queue.getUsers()
        ]
    );
    return result.rows[0]
};

const addUserinQueue = async (username, queue, schema) => {
    const usuario = await pool.query(
        `SELECT * FROM ${schema}.users WHERE name=$1`,
        [username]
    );
    
    const userData = usuario.rows[0];

    if (!userData) {
        console.log("Usuário não encontrado.");
        return;
    }

    const queueExist = await pool.query(
        `SELECT * FROM ${schema}.queues WHERE name=$1`,
        [queue]
    )
    
    if (queueExist.rowCount > 0) {
        const result = await pool.query(
            `UPDATE ${schema}.queues
             SET users = users || $1::jsonb
             WHERE name=$2
             RETURNING *`,
            [JSON.stringify([userData.id, userData.name]), queue] // ← aqui também
        )
        return result.rows[0];
    } else {
        console.log('Fila não encontrada');
    }
};

module.exports = {
    createQueue,
    addUserinQueue
}