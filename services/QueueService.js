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

module.exports = {
    createQueue
}