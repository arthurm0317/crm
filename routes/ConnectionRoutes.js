const express = require('express');
const { createConnectionController, setQueueController, getAllConnectionsController, deleteConnectionController, updateWebhookUrlController, toggleWebhookStatusController } = require('../controllers/ConnectionController');
const router = express.Router();

router.get('/get-all-connections/:schema', getAllConnectionsController)
router.post('/create', createConnectionController)
router.post('/setConnQueue', setQueueController)
router.delete('/delete/:connection_id/:instanceName/:schema', deleteConnectionController)

module.exports = router;