const express = require('express');
const router = express.Router();
const { createInstanceController, fetchInstanceController } = require('../controllers/EvolutionController');

router.post('/instance', createInstanceController)
router.get('/fetchInstances', fetchInstanceController)

module.exports = router