const pool = require('../db/queries')
const {Users} = require('../entities/Users')
const { v4: uuidv4 } = require('uuid');

const createUser = async (user, schema) => {

    const result = await pool.query(
        `INSERT INTO ${schema}.users (id, name, email, password, permission) VALUES ($1, $2, $3, $4, $5)`,
        [
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPassword(),
            user.getPermission()
        ]
    );

    return result.rows[0];
};

const getAllUsers = async (schema = 'public') => {
    const result = await pool.query(`SELECT * FROM ${schema}.users`);
    return result.rows;
};
const searchUser = async (user) => {
    const availableSchemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    `);
  
    const schemaNames = availableSchemas.rows.map(row => row.schema_name);
  
    for (const schema of schemaNames) {
      try {
        const result = await pool.query(
          `SELECT * FROM ${schema}.users WHERE email = $1 AND password = $2`,
          [user.getEmail(), user.getPassword()]
        );
  
        if (result.rows.length > 0) {
          return {
            schema,
            user: result.rows[0]
          };
        }
      } catch (err) {
        if (!err.message.includes("relation") && !err.message.includes("does not exist")) {
          console.error(`Erro no schema ${schema}:`, err.message);
        }
      }
    }
  
    return null; 
  };

  const searchUserByName = async()

module.exports = { createUser, getAllUsers, searchUser };