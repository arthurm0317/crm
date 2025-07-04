const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController, getOnlineUsersController, deleteUserController, updateUserController, searchUserByIdController } = require('../controllers/UserController');

router.get('/users/:schema', getAllUsersController);
router.get('/online', getOnlineUsersController)
router.get('/search-user/:schema/:user_id', searchUserByIdController);
router.post('/users', createUserController);
router.post('/login', searchUserController);
router.put('/update-user', updateUserController)
router.delete('/delete-user', deleteUserController)

module.exports = router;