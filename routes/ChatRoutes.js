const express = require('express');
const { setUserChatController, getChatsController, getMessagesController, setQueueController, getChatDataController, getChatByUserController, updateQueueController, sendAudioController, upload } = require('../controllers/ChatController');

const router = express.Router();

router.post('/setChat', setUserChatController);
router.get('/getChats/:schema', getChatsController);
router.post('/getMessages', getMessagesController);
router.post('/setQueue', updateQueueController);
router.get('/:schema/:chatId', getChatDataController);
router.get('/getChat/:userId/:schema', getChatByUserController);
router.post('/sendAudio', upload.single('audio'), sendAudioController);

module.exports = router;