const pool = require('../db/queries')
const {Users} = require('../entities/Users')
const { v4: uuidv4 } = require('uuid');

const createUser = async(user)=>{
    const id = uuidv4();
    const name = user.name;
    const email = user.email;
    const password = user.getPassword();
    const result = await pool.query(
        'INSERT INTO users(id, name, email, password) VALUES ($1, $2, $3, $4)',[id, name, email, password]
    )
    return result.rows[0]
}

const getAllUsers = async()=>{
    const result = await pool.query(
        'SELECT * FROM users'
    )
    return result.rows
}


module.exports = {createUser, getAllUsers}