const express = require('express');
const { createQueueController, addUserinQueueController, getUserQueuesController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/queue', createQueueController)
router.post('/addUser', addUserinQueueController)
router.get('/getUserQueue', getUserQueuesController)

module.exports = router 