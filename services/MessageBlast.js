const { v4: uuidv4 } = require('uuid');
const pool = require("../db/queries");

const createMessageForBlast = async (messageValue, sector, campaingId, schema) => {
  try {
    const result = await pool.query(
      `INSERT INTO ${schema}.message_blast (id, value, sector, campaing_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [uuidv4(), messageValue, sector, campaingId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar mensagem:', error.message);
    throw error;
  }
}

module.exports = {
  createMessageForBlast,
};