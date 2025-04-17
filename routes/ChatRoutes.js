const express = require('express');
const { setUserChatController, getChatsController, getMessagesController } = require('../controllers/ChatController');
const router = express.Router();

router.post('/setChat', setUserChatController);
router.get('/getChats/:schema', getChatsController)
router.post('/getMessages', getMessagesController)

module.exports = router;