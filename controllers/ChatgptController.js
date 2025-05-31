const OpenAI = require('openai');

const chatgptText = async (req, res) => {
  const { message, prompt } = req.body;
  const openai = new OpenAI({
    apiKey: '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'
  });

  try {
    const messages = [];
    if (prompt && prompt.trim()) {
      messages.push({ role: 'system', content: prompt });
    }
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao se comunicar com o ChatGPT' });
  }
};

module.exports = { chatgptText };