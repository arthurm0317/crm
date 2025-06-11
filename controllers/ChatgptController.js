const OpenAI = require('openai');
const pool = require('../db/queries');

const chatgptText = async (req, res) => {
  const { message, prompt } = req.body;
  const openai = new OpenAI({ apiKey: 'SUA_API_KEY_OPENAI' });

  try {
    const systemPrompt = `
      Você é um assistente que responde perguntas sobre o CRM.
      O banco de dados possui as seguintes tabelas e colunas:
      - clientes (id, nome, idade, data_entrada, email, telefone, ...)
      - vendas (id, cliente_id, valor, data_venda, ...)
      - tag (id, nome, cor)
      - chat_tag (chat_id, tag_id)
      Gere apenas a query SQL Postgres correspondente à pergunta do usuário, sem explicação, e nunca faça comandos que não sejam SELECT.
      Exemplo de resposta: SELECT COUNT(*) FROM clientes WHERE idade = 30 AND data_entrada >= '2024-05-01';
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(prompt ? [{ role: 'system', content: prompt }] : []),
        { role: 'user', content: message }
      ],
    });

    const sql = completion.choices[0].message.content.trim();

    if (!sql.toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: 'Apenas SELECTs são permitidos.' });
    }

    const result = await pool.query(sql);

    res.json({ response: result.rows });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao processar a consulta.' });
  }
};

module.exports = { chatgptText };