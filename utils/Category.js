const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');

const createCategory = async(name, schema)=>{
    const result = await pool.query(
        `INSERT INTO ${schema}.category (id, name) VALUES ($1, $2) RETURNING *`,
        [uuidv4(), name]
    );
    return result.rows[0];
}

module.exports = {
    createCategory
}