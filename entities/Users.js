export class User{

    constructor(id, name, email, password){
        this.id=id;
        this.name=name;
        this.email=email;
        this._password=password;
    }
    constructor(id, name, email, password, permission, online){
        this.id=id;
        this.name=name;
        this.email=email;
        this._password=password;
        this.permission=permission;
        this.queue=[];
        this.online=online
        this.chats=[];
    }


    get id(){
        return this.id
    }

    get name(){
        return this.name
    }
    set name(name){
        this.name=name
    }

    get email(){
        return this.email
    }
    set email(email){
        this.email=email
    }

    get permission(){
        return this.permission
    }
    set permission(permission){
        this.permission = permission
    }

    get online(){
        return this.online
    }
    set online(boolean){
        this.online = boolean
    }
    
    addQueue(queueId) {
        this.queue.push(queueId)
    }
    removeQueue(queueId){
        this.queue.pop(queueId)
    }

}