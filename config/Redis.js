require('dotenv').config({ path: '../.env' });
const IORedis = require('ioredis');

function createRedisConnection() {
  const redis = new IORedis({
    host: '127.0.0.1',
    port: '6379',
    maxRetriesPerRequest: null,
  });


  redis.ping().then((res) => {
  }).catch((err) => {
    console.error('Erro ao conectar ao Redis:', err.message);
  });

  return redis;
}

module.exports = createRedisConnection;
