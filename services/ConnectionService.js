const pool = require("../db/queries")

const createConnection = async(connection, schema)=>{
    const connectionExists = await pool.query(
        `SELECT * FROM ${schema}.connections WHERE number=$1`, [connection.getNumber()]
    )
    if(connectionExists.rowCount>0){
        return connectionExists.rows[0]
    }else{
        const result = await pool.query(`INSERT INTO ${schema}.connections (id, name, number) VALUES ($1, $2, $3)`,
        [
            connection.getId(),
            connection.getName(),
            connection.getNumber()
        ]
        );
        return result.rows[0]
    }
}

const fetchInstance = async(schema)=>{
    const result = await pool.query(
        `SELECT * FROM ${schema}.connections`
    )
    return result.rows
}
const searchConnById = async (instanceId, schema) => {
    try {
      const query = `
        SELECT * 
        FROM "${schema}".connections 
        WHERE id = $1
      `;
      const result = await pool.query(query, [instanceId]);
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar conexão por ID:', err);
      throw err;
    }
  };
module.exports = {
    createConnection,
    fetchInstance,
    searchConnById
}