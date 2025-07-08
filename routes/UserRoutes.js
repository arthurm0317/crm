const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController, getOnlineUsersController, deleteUserController, updateUserController, searchUserByIdController, logoutController, verifyToken, refreshTokenController } = require('../controllers/UserController');

router.get('/users/:schema', getAllUsersController);
router.get('/users/online', getOnlineUsersController)
router.get('/search-user/:schema/:user_id', searchUserByIdController);
router.post('/users', createUserController);
router.post('/login', searchUserController);
router.post('/logout', logoutController);
// router.post('/refresh-token', refreshTokenController)
router.put('/update-user', updateUserController)
router.delete('/delete-user', deleteUserController)

module.exports = router;