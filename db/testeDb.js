require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

console.log("postgres_password:", process.env.postgres_password);
console.log("typeof password:", typeof process.env.postgres_password);

const pool = new Pool({
  user: process.env.postgres_username,
  host: process.env.postgres_host,
  database: process.env.postgres_db,
  password: process.env.postgres_password,
  port: Number(process.env.postgres_port),
});

pool.connect()
  .then(() => {
    console.log('Conexão com PostgreSQL OK!');
    pool.end();
  })
  .catch((err) => {
    console.error('Erro ao conectar:', err);
  });
