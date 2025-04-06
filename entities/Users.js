class Users{

    constructor(id, name, email, password, permission=null, online=false){
        this.id=id;
        this.name=name;
        this.email=email;
        this._password=password;
        this.permission=permission;
        this.queue=[];
        this.online=online
        this.chats=[];
    }


    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    getEmail() {
        return this.email;
    }
    setEmail(email) {
        this.email = email;
    }

    getPermission() {
        return this.permission;
    }
    setPermission(permission) {
        this.permission = permission;
    }

    isOnline() {
        return this.online;
    }
    setOnline(boolean) {
        this.online = boolean;
    }

    addQueue(queueId) {
        this.queue.push(queueId);
    }

    removeQueue(queueId) {
        this.queue = this.queue.filter(q => q !== queueId);
    }
    getPassword(){
        return this._password
    }
}
module.exports = { Users };