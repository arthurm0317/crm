const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController, searchUserController } = require('../controllers/UserController');

router.post('/users', createUserController);
router.get('/users', getAllUsersController);
router.get('/login', searchUserController);
module.exports = router;