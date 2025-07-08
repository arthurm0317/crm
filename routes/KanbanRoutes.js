const express = require('express');
const { createKanbanStageController, createMessageForBlastController, getFunisController, getKanbanStagesController, getChatsInKanbanController, changeKanbanStageController, updateStageNameController, createFunilController, deleteEtapaController, getCustomFieldsController, transferAllChatsToStage, deleteFunilController } = require('../controllers/KanbanController');
const router = express.Router();

router.post('/create-kanban', createKanbanStageController);
router.post('/message-blast', createMessageForBlastController)
router.get('/get-funis/:schema', getFunisController),
router.get('/get-stages/:funil/:schema', getKanbanStagesController)
router.get('/get-cards/:sector/:schema', getChatsInKanbanController)
router.get('/get-custom-fields/:schema', getCustomFieldsController)
router.put('/change-stage', changeKanbanStageController)
router.put('/update-stage-name', updateStageNameController)
router.put('/transfer-all-chats', transferAllChatsToStage)
router.post('/create-funil', createFunilController)
router.delete('/delete-stage', deleteEtapaController)
router.delete('/delete-funil/:sector/:schema', deleteFunilController)
module.exports = router;