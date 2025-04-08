const  {Chat}  = require("./entities/Chat");

const chat = new Chat(1, "+5511999999999", new Date());

chat.addMessage(1, "Olá!", false);
chat.addMessage(2, "Boa tarde, tudo bem?", true);

console.log(chat);