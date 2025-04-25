const express = require('express');
const { createKanbanStageController } = require('../controllers/KanbanController');
const router = express.Router();

router.post('/create-kanban', createKanbanStageController);

module.exports = router;