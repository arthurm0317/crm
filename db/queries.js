const {Pool} = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
    user: process.env.postgres_username,
    host: process.env.postgres_host,
    database: process.env.postgres_db,
    password: process.env.postgres_password,
    port: Number(process.env.postgres_port),
})

pool.on('connect',()=>{
    console.log('conectado')
})

pool.on('error',(err)=>{
    console.log('error',err)
})

module.exports = pool;