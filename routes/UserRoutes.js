const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController, getOnlineUsersController, deleteUserController, updateUserController } = require('../controllers/UserController');

router.post('/users', createUserController);
router.get('/users/:schema', getAllUsersController);
router.post('/login', searchUserController);
router.get('/online', getOnlineUsersController)
router.delete('/delete-user', deleteUserController)
router.put('/update-user', updateUserController)

module.exports = router;