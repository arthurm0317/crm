const { Message } = require('./Message');

class Chat {
    constructor(id, contact, createdAt, messages = []) {
        this.id = id;
        this.contact = contact;
        this.createdAt = createdAt;
        this.messages = messages;
    }

    addMessage(id, content, fromMe) {
        const msg = new Message(id, content, fromMe, this.id, this.contact, new Date());
        this.messages.push(msg);
    }
}

module.exports = { Chat };