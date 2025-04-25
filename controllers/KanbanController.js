const { createKanbanStage } = require("../services/KanbanService");


const createKanbanStageController = async (req, res) => {
    try {
        const { name } = req.body;
        const schema = req.body.schema || 'effective_gain';
        const result = await createKanbanStage(name, schema);

        res.status(201).json(result);
    } catch (err) {
        console.error("Erro ao criar estágio do Kanban:", err.message);
        res.status(500).json({ error: 'Erro ao criar estágio do Kanban' });
    }
}

module.exports = {
    createKanbanStageController
}