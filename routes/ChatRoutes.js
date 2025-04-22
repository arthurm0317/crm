const express = require('express');
const { setUserChatController, getChatsController, getMessagesController, setQueueController } = require('../controllers/ChatController');
const router = express.Router();

router.post('/setChat', setUserChatController);
router.get('/getChats/:schema', getChatsController)
router.post('/getMessages', getMessagesController)
router.post('/setQueue', setQueueController)

module.exports = router;