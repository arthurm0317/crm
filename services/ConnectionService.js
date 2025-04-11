const pool = require("../db/queries")

const createConnection = async(connection, schema)=>{
    console.log("conxao", connection)
    const result = await pool.query(`INSERT INTO ${schema}.connections (id, name, number) VALUES ($1, $2, $3)`,
    [
        connection.getId(),
        connection.getName(),
        connection.getNumber()
    ]
    );
    return result.rows[0]
}

module.exports = {
    createConnection
}