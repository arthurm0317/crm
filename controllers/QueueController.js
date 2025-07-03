const Queue = require("../entities/Queue");
const { v4: uuidv4 } = require('uuid');
const { createQueue, addUserinQueue, getUserQueues, getAllQueues, deleteQueue, getQueueById, transferQueue, updateUserQueues, toggleWebhookStatus, updateWebhookUrl, getUsersInQueue } = require("../services/QueueService");
const { setUserChat } = require("../services/ChatService");
const { getUserById } = require("../services/UserService");


const createQueueController = async(req, res)=>{
    try{
        const {name, color, super_user, distribution} = req.body;

        const queue = new Queue(uuidv4(), name, color)
        
        const schema = req.body.schema
        const result = createQueue(queue, super_user, distribution, schema)
        
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
    const schema = req.body.schema;

    const result = addUserinQueue(user, queue, schema)

    res.status(201).json({
        result
    })
    }catch(error){
        console.error(error)
    }
}

const getUserQueuesController=async(req,res)=>{
    try{
        const {userId}=req.params
        const schema = req.params.schema

        const result = await getUserQueues(userId, schema)
        res.status(201).json({
            result
        })
    }catch(error){
        console.error(error)
    }
    
}

const getAllQueuesControllers = async(req, res)=> {
    try{
        const {schema} = req.params
        const result = await getAllQueues(schema)
        res.status(201).json({
            result
        })
    }catch(error){
        console.error(error)
    }
}
const deleteQueueController = async(req, res)=>{
    try{
        const {queueId, schema} = req.params;
        const result = await deleteQueue(queueId, schema)
    }catch(error){
        console.error(error)
        res.status(500).json({ error: 'Erro ao deletar fila' });
}
}
const getQueueByIdController = async(req, res)=> {
    try{
        const {queue_id, schema} = req.params
        console.error(queue_id, schema)
        const result = await getQueueById(queue_id, schema)
        res.status(201).json({
            result
        })
    }catch(error){
        console.error(error)
        res.status(500).json({ error: 'Erro ao buscar fila' });
    }
}


const transferQueueController = async (req, res) => {
  try {
    const { chatId, newQueueId, schema } = req.body;
    const result = await transferQueue(chatId, newQueueId, schema);
    await setUserChat(chatId, schema)
    res.status(200).json({ result });
  } catch (error) {
    console.error('Erro ao transferir fila:', error.message);
    res.status(500).json({ error: 'Erro ao transferir fila' });
  }
};

const updateUserQueuesController = async (req, res) => {
  try {
    const { userId, queueIds, schema } = req.body;

    if (!userId || !schema) {
      return res.status(400).json({ error: 'userId e schema são obrigatórios' });
    }

    const result = await updateUserQueues(userId, queueIds, schema);
    res.status(200).json({ 
      success: true, 
      message: 'Filas do usuário atualizadas com sucesso',
      result 
    });
  } catch (error) {
    console.error('Erro ao atualizar filas do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar filas do usuário' });
  }
};

const updateWebhookUrlController = async (req, res) => {
    const { queue_id, webhook_url, schema } = req.body;
    try {
        const result = await updateWebhookUrl(queue_id, webhook_url, schema)
        res.status(200).json({
            success:true,
            data:result
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success:false
        })
    }
}
const toggleWebhookStatusController = async (req, res) => {
    const { queue_id, status, schema } = req.body;
    try {
        const result = await toggleWebhookStatus(queue_id, status, schema)
        res.status(200).json({
            success:true,
            data:result
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success:false
        })
    }
}
const getUsersInQueueController = async (req, res) => {
    try {
        const { queue_id, schema } = req.params;
        const result = await getUsersInQueue(queue_id, schema);

        const usersData = [];
        for (const user of result) {
            const userData = await getUserById(user.user_id, schema);
            if (userData) usersData.push(userData);
        }

        res.status(200).json({
            success: true,
            data: result,
            users: usersData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false
        });
    }
};

module.exports = {
    createQueueController,
    addUserinQueueController,
    getUserQueuesController,
    getAllQueuesControllers,
    deleteQueueController,
    getQueueByIdController,
    transferQueueController,
    updateUserQueuesController,
    updateWebhookUrlController,
    toggleWebhookStatusController,
    getUsersInQueueController
}