class Message {
  constructor(id, message, fromMe, chatId, contact, createdAt) {
      this.id = id;
      this.message = message;
      this.fromMe = fromMe;
      this.chatId = chatId;
  }
}

module.exports = { Message };