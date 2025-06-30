const express = require('express');
const ChatInternoController = require('../controllers/ChatInternoController');
const router = express.Router();

router.get('/users/:userId', ChatInternoController.getUsers);
router.get('/messages/:user1/:user2', ChatInternoController.getMessages);
router.post('/send', ChatInternoController.sendMessage);

module.exports = router;