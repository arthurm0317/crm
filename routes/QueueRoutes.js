const express = require('express');
const { createQueueController, addUserinQueueController, getUserQueuesController, getAllQueuesControllers } = require('../controllers/QueueController');

const router = express.Router();

router.post('/queue', createQueueController)
router.post('/addUser', addUserinQueueController)
router.get('/getUserQueue', getUserQueuesController)
router.get('/get-all-queues/:schema', getAllQueuesControllers)

module.exports = router 