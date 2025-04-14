const { v4: uuidv4 } = require('uuid');
const { createInstance } = require('../requests/evolution');

const createInstanceController = async(req, res)=>{
    try{
        console.log("Corpo da requisição:", req.body);
        const {instanceName, number} = req.body

        const result = await createInstance({
            instanceName: instanceName,
            number:number
          });

        res.status(201).json({
            result
        })
    }catch(error){
        console.error("Erro ao criar instancia:", error.message);
        res.status(500).json({ error: 'Erro ao criar instancia' });
    }
}

module.exports = {
    createInstanceController
}