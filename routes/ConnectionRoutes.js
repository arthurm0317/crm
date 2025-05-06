const express = require('express');
const { createConnectionController, setQueueController, getAllConnectionsController } = require('../controllers/ConnectionController');
const router = express.Router();

router.post('/create', createConnectionController)
router.post('/setConnQueue', setQueueController)
router.post('/getAllConnections', getAllConnectionsController)

module.exports = router;