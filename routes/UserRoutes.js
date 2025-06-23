const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController, getOnlineUsersController, deleteUserController, updateUserController, searchUserByIdController } = require('../controllers/UserController');

router.post('/users', createUserController);
router.post('/login', searchUserController);
router.get('/users/:schema', getAllUsersController);
router.get('/online', getOnlineUsersController)
router.delete('/delete-user', deleteUserController)
router.put('/update-user', updateUserController)
router.get('/search-user/:schema/:user_id', searchUserByIdController);

module.exports = router;