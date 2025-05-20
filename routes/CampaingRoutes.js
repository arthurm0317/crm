const express = require('express');
const { startCampaingController } = require('../controllers/CampaingContoller');
const router = express.Router();

router.post('/start', startCampaingController)

module.exports = router;
