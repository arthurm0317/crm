const express = require('express');
const { createKanbanStageController, createMessageForBlastController, getFunisController, getKanbanStagesController, getChatsInKanbanController, changeKanbanStageController } = require('../controllers/KanbanController');
const router = express.Router();

router.post('/create-kanban', createKanbanStageController);
router.post('/message-blast', createMessageForBlastController)
router.get('/get-funis/:schema', getFunisController),
router.get('/get-stages/:funil/:schema', getKanbanStagesController)
router.get('/get-cards/:sector/:schema', getChatsInKanbanController)
router.put('/change-stage', changeKanbanStageController)
module.exports = router;