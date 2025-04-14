const express = require('express');
const router = express.Router();
const { createInstanceController } = require('../controllers/EvolutionController');

router.post('/instance', createInstanceController)

module.exports = router