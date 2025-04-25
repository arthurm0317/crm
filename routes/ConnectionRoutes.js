const express = require('express');
const { createConnectionController, setQueueController } = require('../controllers/ConnectionController');
const router = express.Router();

router.post('/create', createConnectionController)
router.post('/setConnQueue', setQueueController)

module.exports = router;