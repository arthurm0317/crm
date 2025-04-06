const express = require('express');
const router = express.Router();
const { createUserController, getAllUsersController } = require('../controllers/UserController');

router.post('/users', createUserController);
router.get('/users', getAllUsersController);
module.exports = router;