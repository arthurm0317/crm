const express = require('express');
const { createKanbanStageController, createMessageForBlastController } = require('../controllers/KanbanController');
const { createMessageForBlast } = require('../services/MessageBlast');
const router = express.Router();

router.post('/create-kanban', createKanbanStageController);
router.post('/message-blast', createMessageForBlastController)
module.exports = router;