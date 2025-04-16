const express = require('express');
const { setUserChatController } = require('../controllers/ChatController');
const router = express.Router();

router.post('/setChat', setUserChatController);

module.exports = router;