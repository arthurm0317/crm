const express = require('express');
const { createQueueController, addUserinQueueController, getUserQueuesController, getAllQueuesControllers, deleteQueueController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/create-queue', createQueueController)
router.post('/addUser', addUserinQueueController)
router.get('/getUserQueue', getUserQueuesController)
router.get('/get-all-queues/:schema', getAllQueuesControllers)
router.delete('/delete-queue/:queueId/:schema', deleteQueueController)

module.exports = router 