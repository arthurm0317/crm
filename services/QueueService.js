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
            `INSERT INTO ${schema}.queue_users (user_id, queue_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`, [userData.id, queueExist.rows[0].id] 
        )
        return result.rows[0];
    } else {
        console.log('Fila não encontrada');
    }
};

const getUserQueues = async(username, schema)=>{
    const user = await pool.query(
        `SELECT * FROM ${schema}.users WHERE name=$1`,[username]
    )

    const queue = await pool.query(
        `SELECT * FROM ${schema}.queue_users where user_id=$1`,[user.rows[0].id]
    )

    for (let i = 0; i < queue.rowCount; i++) {
        const result = await pool.query(
        `SELECT * FROM ${schema}.queues WHERE id=$1`,[queue.rows[i].queue_id]
    )
    return result.rows[i]
    }
}

module.exports = {
    createQueue,
    addUserinQueue,
    getUserQueues
}