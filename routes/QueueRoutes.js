const express = require('express');
const { createQueueController, addUserinQueueController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/queue', createQueueController)
router.post('/addUser', addUserinQueueController)

module.exports = router 