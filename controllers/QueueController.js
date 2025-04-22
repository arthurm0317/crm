const Queue = require("../entities/Queue");
const { v4: uuidv4 } = require('uuid');
const { createQueue, addUserinQueue, getUserQueues } = require("../services/QueueService");

const createQueueController = async(req, res)=>{
    try{
        const {name, color} = req.body;

        const queue = new Queue(uuidv4(), name, color)
        
        const schema = req.body.schema || 'crm'
        const result = createQueue(queue, schema)
        
        res.status(201).json({
            result
        })
    }catch(error){
        console.error("Erro ao criar fila:", error.message);
        res.status(500).json({ error: 'Erro ao criar fila' });
    }
}

const addUserinQueueController = async(req, res)=>{    
   try{
    const {user, queue}=req.body;
    const schema = req.body.schema || 'crm';

    console.log("Body recebido:", req.body);
    
    const result = addUserinQueue(user, queue, schema)

    res.status(201).json({
        result
    })
    }catch(error){
        console.log(error)
    }
}

const getUserQueuesController=async(req,res)=>{
    try{
        const {username}=req.body
        const schema = req.body.schema || 'public';

        const result = await getUserQueues(username, schema)
        res.status(201).json({
            result
        })
    }catch(error){
        console.log(error)
    }
    
}


module.exports = {
    createQueueController,
    addUserinQueueController,
    getUserQueuesController
}