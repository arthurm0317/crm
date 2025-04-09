const { Message } = require('./Message');

class Chat {
    constructor(id, server, number, serialized, fromMe, contact, isGroup=false, createdAt, messages = []) {
        this.id = id;
        this.server = server;
        this.number = number;
        this.serialized = serialized;
        this.fromMe = fromMe;
        this.isGroup = isGroup;
        this.contact = contact;
        this.createdAt = createdAt;
        this.messages = messages;
    }

    addMessage(id, content, fromMe) {
        const msg = new Message(id, content, fromMe, this.id, this.contact, new Date());
        this.messages.push(msg);
    }
    getId(){
        return this.id
    }
    getServer(){
        return this.server
    }
    getNumber(){
        return this.number
    }
    getSerialized(){
        return this.serialized
    }
    getIsGroup(){
        return this.isGroup
    }
    getContact(){
        return this.contact
    }
    getCreatedAt(){
        return this.createdAt
    }
    getMessages(){
        return this.messages
    }
    getFromMe(){
        return this.fromMe
    }


}

module.exports = { Chat };