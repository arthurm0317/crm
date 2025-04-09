const Queue = require("../entities/Queue");
const { v4: uuidv4 } = require('uuid');
const { createQueue } = require("../services/QueueService");

const createQueueController = async(req, res)=>{
    try{
        const {name, color} = req.body;

        const queue = new Queue(uuidv4(), name, color)
        
        const schema = req.body.schema || 'public'
        const result = createQueue(queue, schema)
        
        res.status(201).json({
            result
        })
    }catch(error){
        console.error("Erro ao criar fila:", error.message);
        res.status(500).json({ error: 'Erro ao criar fila' });
    }
}

module.exports = {
    createQueueController
}