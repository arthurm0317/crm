const pool = require('../db/queries')

const createUser = async(dados)=>{
    const{id, name, email, password} = dados;
    const result = await pool.query(
        'INSERT INTO users(id, nome, email, passwors) VALUES ($1, $2, $3, $4)',[id, name, email, password]
    )
    return result.rows[0]
}

module.exports = {createUser}