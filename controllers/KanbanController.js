const { createKanbanStage } = require("../services/KanbanService");
const { createMessageForBlast } = require("../services/MessageBlast");


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

const createMessageForBlastController = async (req, res) => {
    try {
        const { messageValue, sector } = req.body;
        const schema = req.body.schema || 'effective_gain';
        const result = await createMessageForBlast(messageValue, sector, schema);

        res.status(201).json(result);
    } catch (err) {
        console.error("Erro ao criar mensagem para blast:", err.message);
        res.status(500).json({ error: 'Erro ao criar mensagem para blast' });
    }
}
module.exports = {
    createKanbanStageController,
    createMessageForBlastController
}