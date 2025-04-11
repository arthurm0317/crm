const express = require('express');
const { createConnectionController } = require('../controllers/ConnectionController');
const router = express.Router();

router.post('/create', createConnectionController)

module.exports = router;