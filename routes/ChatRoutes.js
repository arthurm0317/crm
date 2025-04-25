const express = require('express');
const { setUserChatController, getChatsController, getMessagesController, setQueueController, getChatDataController } = require('../controllers/ChatController');
const router = express.Router();

router.post('/setChat', setUserChatController);
router.get('/getChats/:schema', getChatsController)
router.post('/getMessages', getMessagesController)
router.post('/setQueue', setQueueController)
router.get('/:schema/:chatId', getChatDataController)

module.exports = router;