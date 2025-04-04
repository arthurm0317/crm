export class Company{
    constructor(id, name, superAdmin){
        this.id=id;
        this.name=name;
        this.superAdmin=superAdmin
        this.users=[]
        this.queues=[]
    }

    get id(){
        return this.id;
    }

    
    
}