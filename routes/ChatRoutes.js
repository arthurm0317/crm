const express = require('express');
const { setUserChatController, getChatsController, getMessagesController, setQueueController, getChatDataController, getChatByUserController } = require('../controllers/ChatController');
const router = express.Router();

router.post('/setChat', setUserChatController);
router.get('/getChats/:schema', getChatsController)
router.post('/getMessages', getMessagesController)
router.post('/setQueue', setQueueController)
router.get('/:schema/:chatId', getChatDataController)
router.get('/getChat/:userId/:schema', getChatByUserController)

module.exports = router;