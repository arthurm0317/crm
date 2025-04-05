const { Evolution } = require('./requests/evolution');
require('dotenv').config();

const evolution = new Evolution(process.env.EVOLUTION_API_KEY, process.env.EVOLUTION_SERVER_URL);

const instanceData = {
  instanceName: 'arthur-instance',
  number: '557588821124',
  qrcode: true,
  integration: 'WHATSAPP-BAILEYS',
};

evolution.createInstance(instanceData);
console.log(evolution.qrcode)
