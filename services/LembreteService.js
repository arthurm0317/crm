const { v4: uuidv4 } = require('uuid');
const  pool  = require('../db/queries'); 

const createLembrete = async (lembrete_name, tag, message, date, schema) => {
    try {
        const result = await pool.query(
            `INSERT INTO ${schema}.lembretes(id, lembrete_name, tag, message, date) VALUES($1, $2, $3, $4, $5)`,[uuidv4(),lembrete_name, tag, message, date]
        )
        return result
    } catch (error) {
        console.error(error)
    }
}

const getLembretes = async (schema) => {
    const result = await pool.query(
        `SELECT * FROM ${schema}.lembretes`
    )
    return result.rows
}

const updateLembretes = async (id, lembrete_name, tag, message, date, icone, schema) => {
    const result = await pool.query(`UPDATE ${schema}.lembretes SET lembrete_name=$1, tag=$2, message=$3, date=$4, icone=$5 where id=$6 RETURNING *`,[lembrete_name, tag, message, date, icone, id]
    )
    return result.rows
}

const deleteLembrete = async (id, schema) => {
    const result = await pool.query(`DELETE FROM ${schema}.lembretes where id=$1`,[id])
}

module.exports={
    createLembrete,
    getLembretes,
    updateLembretes,
    deleteLembrete
}