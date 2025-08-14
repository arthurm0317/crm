const {Pool} = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

console.log('Variáveis de ambiente PostgreSQL:');
console.log('Username:', process.env.postgres_username || 'não definido');
console.log('Host:', process.env.postgres_host || 'não definido');
console.log('Database:', process.env.postgres_db || 'não definido');
console.log('Port:', process.env.postgres_port || 'não definido');

const pool = new Pool({
    user: process.env.postgres_username || 'postgres',
    host: process.env.postgres_host || 'localhost',
    database: process.env.postgres_db || 'postgres',
    password: process.env.postgres_password || 'postgres',
    port: Number(process.env.postgres_port) || 5432,
})

pool.on('connect',()=>{
    console.log('PostgreSQL conectado com sucesso')
})

pool.on('error',(err)=>{
    console.log('Erro na conexão PostgreSQL:', err)
})

module.exports = pool;