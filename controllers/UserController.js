const { createUser, getAllUsers, searchUser} = require('../services/UserService');
const { Users } = require('../entities/Users');
const { v4: uuidv4 } = require('uuid');

const createUserController = async (req, res) => {
    try {
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
const searchUserController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new Users(null, null, email, password, null);
    const result = await searchUser(user.getEmail(), user.getPassword());

    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      schema: result.schema,
      user: result.user
    });

  } catch (error) {
    console.error("Erro ao buscar usuário:", error.message);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

module.exports ={
    createUserController,
    getAllUsersController,
    searchUserController
}