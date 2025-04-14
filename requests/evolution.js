require('dotenv').config();

const createInstance = async ({ instanceName, number }) => {
  const payload = {
    instanceName,
    token: instanceName,
    number,
    integration: "WHATSAPP-BAILEYS",
    qrcode: true
  };

  const options = {
    method: 'POST',
    headers: {
      apikey: process.env.EVOLUTION_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(`${process.env.EVOLUTION_SERVER_URL}/instance/create`, options);
    const result = await response.json();
    console.log('Instância criada:', result);
    return result;
  } catch (err) {
    console.error('Erro ao criar instância:', err);
  }
};



module.exports = { createInstance };
