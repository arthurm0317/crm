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

module.exports = { createUser, getAllUsers };