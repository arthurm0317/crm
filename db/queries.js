const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
  host: 'localhost',
  database: 'crm',
  password: '123123',
  port: 5432,
})

pool.on('connect',()=>{
    console.log('conectado')
})

pool.on('error',(err)=>{
    console.log('error',err)
})

module.exports = pool;