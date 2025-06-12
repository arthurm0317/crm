require('dotenv').config({ path: '../.env' });
const IORedis = require('ioredis');

function createRedisConnection() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  });

  console.log('Tentando conectar ao Redis...');

  redis.ping().then((res) => {
    console.log('Resposta do Redis:', res); 
  }).catch((err) => {
    console.error('Erro ao conectar ao Redis:', err.message);
  });

  return redis;
}

module.exports = createRedisConnection;
