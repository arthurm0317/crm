const express = require('express');
const { Chat } = require('../entities/Chat');
const app = express();
const { v4: uuidv4 } = require('uuid');

app.use(express.json());

app.post('/chat', (req, res) => {
  const result = req.body;
  console.log(result);
  const chatCriado=new Chat(uuidv4(),'557588040003',Date.now())
  console.log(chatCriado)
  res.status(200).json({
    result
  })
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Webhook ouvindo na porta ${PORT}`);
});
