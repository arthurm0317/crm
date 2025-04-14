const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController, getOnlineUsersController } = require('../controllers/UserController');

router.post('/users', createUserController);
router.get('/users', getAllUsersController);
router.post('/login', searchUserController);
router.get('/online', getOnlineUsersController)
module.exports = router;