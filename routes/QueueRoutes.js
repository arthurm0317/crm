const express = require('express');
const {transferQueueController, createQueueController, addUserinQueueController, getUserQueuesController, getAllQueuesControllers, deleteQueueController, getQueueByIdController, updateUserQueuesController, toggleWebhookStatusController, updateWebhookUrlController, getUsersInQueueController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/create-queue', createQueueController)
router.post('/addUser', addUserinQueueController)
router.get('/get-user-queue/:userId/:schema', getUserQueuesController)
router.get('/get-all-queues/:schema', getAllQueuesControllers)
router.delete('/delete-queue/:queueId/:schema', deleteQueueController)
router.get('/get-conn-queues/:queue_id/:schema', getQueueByIdController)
router.post('/transfer-queue', transferQueueController)
router.post('/update-user-queues', updateUserQueuesController)
router.put('/update-webhook-url', updateWebhookUrlController)
router.put('/toggle-webhook-status', toggleWebhookStatusController)
router.get('/get-users-in-queue/:queue_id/:schema', getUsersInQueueController)
module.exports = router 