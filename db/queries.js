const {Pool} = require('pg');
require('dotenv').config()

const pool = new Pool({
    user: process.env.postgres_username,
    host: process.env.postgres_host,
    database: process.env.postgres_db,
    password: process.env.postgres_password,
    port: process.env.postgres_port,
})

pool.on('connect',()=>{
    console.log('conectado')
})

pool.on('error',(err)=>{
    console.log('error',err)
})

module.exports = pool;