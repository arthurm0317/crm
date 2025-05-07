require('dotenv').config();
const axios = require('axios'); 

const createInstance = async ({ instanceName, number }) => {
  const payload = {
    instanceName,
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
    return result;
  } catch (err) {
    console.error('Erro ao criar instância:', err);
  }
};
const fetchInstanceEvo = async(instanceName)=>{
  const options = {
    method: 'GET',
    headers: {
      apikey: process.env.EVOLUTION_API_KEY,
      'Content-Type': 'application/json'
    },
  };
  try {
    const response = await fetch(`${process.env.EVOLUTION_SERVER_URL}/instance/fetchInstances?instanceName=${instanceName}`, options);
    const result = await response.json();
    console.log(result)
    
    return result;
  } catch (err) {
    console.error('Erro ao buscar instâncias:', err);
  }

}
const sendTextMessage = async(instanceId, text, number)=>{
  console.log("instanceId", instanceId)
  console.log("text", text)
  console.log("number", number)
  const payload = {
    text,
    number
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
    const response = await fetch(`${process.env.EVOLUTION_SERVER_URL}/message/sendText/${instanceId}`, options);
    const result = await response.json();
    console.log(result)
    
    return result;
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
}
const getBase64FromMediaMessage = async (instanceId, mediaKey) => {
  try {
    if (!process.env.EVOLUTION_SERVER_URL) {
      throw new Error('EVOLUTION_SERVER_URL não está configurado no arquivo .env');
    }

    if (!instanceId || !mediaKey) {
      throw new Error('instanceId ou mediaKey não foram fornecidos ou estão inválidos');
    }

    const url = `${process.env.EVOLUTION_SERVER_URL}/chat/getBase64FromMediaMessage/${instanceId}`;

    const response = await axios.post(
      url,
      { message:{key:{id:mediaKey}}}, 
      {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Base64 decodificado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao decodificar mídia:', error.message);
    throw error;
  }
};
const searchContact = async (remoteJid, instanceId) => {
  const payload = {
    where: {
      remoteJid,
    },
    instanceId,
  };

  const options = {
    method: 'POST',
    headers: {
      apikey: process.env.EVOLUTION_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(`${process.env.EVOLUTION_SERVER_URL}/chat/findContacts/${instanceId}`, options);
    const result = await response.json();
    console.log(result);

    return result;
  } catch (err) {
    console.error('Erro ao buscar contato:', err);
  }
};
const sendAudioToWhatsApp = async (number, audioBase64, instanceId) => {
  try {
    if (!process.env.EVOLUTION_SERVER_URL) {
      throw new Error('EVOLUTION_SERVER_URL não está configurado no arquivo .env');
    }

    if (!instanceId) {
      throw new Error('instanceId não foi fornecido ou está inválido');
    }

    const url = `${process.env.EVOLUTION_SERVER_URL}/message/sendWhatsAppAudio/${instanceId}`;

    const response = await axios.post(url, {
      number: number,
      audio: audioBase64,
    }, {
      headers: {
        apikey: process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Áudio enviado para o WhatsApp com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar áudio para o WhatsApp:', error.message);
    throw error;
  }
  
};

module.exports = { createInstance, fetchInstanceEvo, sendTextMessage, searchContact, sendAudioToWhatsApp, getBase64FromMediaMessage};


