const { createUser, getAllUsers } = require('../services/UserService');
const { Users } = require('../entities/Users');
const { v4: uuidv4 } = require('uuid');

const createUserController = async (req, res) => {
    try {
      console.log("createUser foi chamado!");
      console.log("BODY RECEBIDO:", req.body);
  
      const { name, email, password, permission } = req.body;
  
      const user = new Users(
        uuidv4(),
        name,
        email,
        password,
        permission
      );
  
        const schema = req.body.schema || 'public';
        const result = await createUser(user, schema);

      res.status(201).json(result);
  
    } catch (err) {
      console.error("Erro ao criar usuário:", err.message);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  };
const getAllUsersController = async(req, res)=>{
    try{
        const result = await getAllUsers()
        res.status(201).json({
            users:result
        })
    }catch(error){
        res.status(500).json({
            message:'Não foi possivel exibir os usuários'
        })
    }
}
module.exports ={
    createUserController,
    getAllUsersController
}