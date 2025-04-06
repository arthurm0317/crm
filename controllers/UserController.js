const { createUser, getAllUsers } = require('../services/UserService');
const { Users } = require('../entities/Users');
const { v4: uuidv4 } = require('uuid');

const createUserController = async(req, res)=>{
    try{
        const {name, email, password} = req.body;

        const newUser = new Users(uuidv4(), name, email, password);
        const result = await createUser(newUser);

        res.status(201).json({
            message:'Usuario criado', user:result
        })
    }catch(error){
        console.log('Não foi possivel criar o usuário', error.message)
        res.status(500).json({
            message:'Não foi possivel criar o usuário'
        })
    }
}
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