const { Queue } = require('bullmq');
const bullConn = {
  host: '31.97.29.7',
  port: 6379,
  password: 'ilhadogovernadorredis'
};

async function addJob() {
  const queue = new Queue('Campanha', { connection: bullConn });
  const job = await queue.add('send-message', {
    instance: 'relacionamento',
    message: 'Olá do teste',
    number: '557588821124',
    schema: 'ilha_do_gov'
  });
  console.log('Job adicionado:', job.id);
}

addJob();