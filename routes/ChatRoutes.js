const express = require('express');
const {
  processReceivedAudio, updateContactNameController, setUserChatController, sendImageController, getChatsController, getMessagesController, setQueueController, getChatDataController, getChatByUserController, updateQueueController, sendAudioController, uploadImage, uploadAudio,
  setMessageAsReadController,
  closeChatContoller,
  setSpecificUserController,
  scheduleMessageController,
  getScheduledMessagesController,
} = require('../controllers/ChatController'); 
const { updateContactName } = require('../services/ChatService');
const router = express.Router();

router.get('/getChats/:schema', getChatsController);
router.get('/:schema/:chatId', getChatDataController);
router.get('/getChat/:userId/:schema/:role', getChatByUserController);
router.get('/scheduled-messages/:chat_id/:schema', getScheduledMessagesController)
router.post('/setChat', setUserChatController);
router.post('/getMessages', getMessagesController);
router.post('/setQueue', updateQueueController);
router.post('/sendAudio', uploadAudio.single('audio'), sendAudioController);
router.post('/chat/processReceivedAudio', processReceivedAudio);
router.post('/sendImage', uploadImage.single('image'), sendImageController); 
router.post('/setAsRead', setMessageAsReadController)
router.post('/close', closeChatContoller)
router.post('/setUser', setSpecificUserController)
router.post('/schedule-message', scheduleMessageController)
module.exports = router;