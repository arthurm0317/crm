const ChatInternoService = require('../services/ChatInternoService');

exports.getUsers = async (req, res) => {
  try {
    const schema = req.query.schema;
    const currentUserId = req.params.userId;
    
    if (!schema) {
      return res.status(400).json({ error: 'Schema é obrigatório' });
    }
    
    const users = await ChatInternoService.getUsers(currentUserId, schema);
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const schema = req.query.schema;
    const messages = await ChatInternoService.getMessages(user1, user2, schema);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message, schema } = req.body;
    const saved = await ChatInternoService.saveMessage(sender_id, receiver_id, message, schema);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
};