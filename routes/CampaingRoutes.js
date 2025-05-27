const express = require('express');
const { startCampaingController, getCampaingsController, getCampaingByIdController } = require('../controllers/CampaingContoller');
const router = express.Router();

router.post('/start', startCampaingController)
router.get('/get-campaing/:schema', getCampaingsController)
router.get('/get-campaing/:campaing_id/:schema', getCampaingByIdController)

module.exports = router;
