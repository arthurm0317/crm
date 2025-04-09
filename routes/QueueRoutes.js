const express = require('express');
const { createQueueController } = require('../controllers/QueueController');

const router = express.Router();

router.post('/queue', createQueueController)

module.exports = router