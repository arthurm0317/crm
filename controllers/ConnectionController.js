const Connection = require("../entities/Connection")
const { v4: uuidv4 } = require('uuid');
const { createConnection, setQueue } = require("../services/ConnectionService");

const createConnectionController = async(req, res)=>{
    try{
        const {name, number} = req.body
        const conn = new Connection(
            uuidv4(),
            name,
            number,
            []
        )
        console.log(conn)
        const schema = req.body.schema || 'effective_gain';
        const result = await createConnection(conn, schema);

      res.status(201).json(result);
    }catch (err) {
        console.error("Erro ao criar conexão:", err.message);
        res.status(500).json({ error: 'Erro ao conexão' });
      }
}
const setQueueController = async(req, res)=>{
    try{
        const {connectionNumber, queueName} = req.body
        const schema = req.body.schema || 'effective_gain';
        const result = await setQueue(connectionNumber, queueName, schema);

      res.status(201).json(result);
    }catch (err) {
        console.error("Erro ao criar conexão:", err.message);
        res.status(500).json({ error: 'Erro ao conexão' });
      }
}

module.exports = {
    createConnectionController, 
    setQueueController
}