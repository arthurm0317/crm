const express = require('express');
const { createConnectionController, setQueueController, getAllConnectionsController } = require('../controllers/ConnectionController');
const router = express.Router();

router.post('/create', createConnectionController)
router.post('/setConnQueue', setQueueController)
router.get('/get-all-connections/:schema', getAllConnectionsController)

module.exports = router;