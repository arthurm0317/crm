const express = require('express');
const {transferQueueController, createQueueController, addUserinQueueController, getUserQueuesController, getAllQueuesControllers, deleteQueueController, getQueueByIdController, updateUserQueuesController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/create-queue', createQueueController)
router.post('/addUser', addUserinQueueController)
router.get('/get-user-queue/:userId/:schema', getUserQueuesController)
router.get('/get-all-queues/:schema', getAllQueuesControllers)
router.delete('/delete-queue/:queueId/:schema', deleteQueueController)
router.get('/get-conn-queues/:queue_id/:schema', getQueueByIdController)
router.post('/transfer-queue', transferQueueController)
router.post('/update-user-queues', updateUserQueuesController)

module.exports = router 