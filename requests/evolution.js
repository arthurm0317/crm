require('dotenv').config();

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
    const response = await axios.post(`${process.env.EVOLUTION_SERVER_URL}/message/sendWhatsAppAudio/${instanceId}`, { 
      number: number,
      audio: audioBase64,
    });

    console.log('Áudio enviado para o WhatsApp com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar áudio para o WhatsApp:', error);
    throw error;
  }
};


module.exports = { createInstance, fetchInstanceEvo, sendTextMessage, searchContact, sendAudioToWhatsApp};
