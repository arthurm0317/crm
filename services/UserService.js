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
const searchUser = async (userMail, userPassword) => {
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
          [userMail, userPassword]
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

  const changeOnline = async(userId, schema)=>{
    const result = await pool.query(
      `UPDATE ${schema}.users SET online=true WHERE id=$1`,[userId]
    )
    return result.rows[0]
  }

  const getOnlineUsers = async(schema)=>{
    const result = await pool.query(`SELECT * FROM ${schema}.users WHERE online=true`);
    return result.rows;
  }

  const getLastAssignedUser = async (queue) => {
    const result = await pool.query(
      'SELECT user_id FROM last_assigned_user WHERE queue = $1',
      [queue]
    );
    return result.rows[0] || null;
  };
  const updateLastAssignedUser = async (queue, user_id) => {
    await pool.query(
      `INSERT INTO last_assigned_user (queue, user_id)
       VALUES ($1, $2)
       ON CONFLICT (queue)
       DO UPDATE SET user_id = EXCLUDED.user_id`,
      [queue, user_id]
    );
  };
module.exports = { createUser, getAllUsers, searchUser, changeOnline, getOnlineUsers, getLastAssignedUser, updateLastAssignedUser};