const { createKanbanStage, getFunis, getKanbanStages } = require("../services/KanbanService");
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
        const { messageValue, sector, campaingId } = req.body;
        const schema = req.body.schema || 'effective_gain';
        const result = await createMessageForBlast(messageValue, sector, campaingId, schema);

        res.status(201).json(result);
    } catch (err) {
        console.error("Erro ao criar mensagem para blast:", err.message);
        res.status(500).json({ error: 'Erro ao criar mensagem para blast' });
    }
}
const getFunisController = async (req, res) => {
    try{
        const schema = req.params.schema
        const funis = await getFunis(schema)
        res.status(200).json(funis);
    }catch (err) {
        console.error("Erro ao buscar funis:", err.message);
        res.status(500).json({ error: 'Erro ao buscar funis' });
}
}
const getKanbanStagesController = async (req, res) => {
    try {
        const funil = req.params.funil;
        const schema = req.params.schema

        console.log("Funil:", funil);
        console.log("Schema:", schema);

        const stages = await getKanbanStages(funil, schema);
        res.status(200).json(stages);
    } catch (err) {
        console.error("Erro ao buscar estágios do Kanban:", err);
        res.status(500).json({ error: 'Erro ao buscar estágios do Kanban' });
    }
}
module.exports = {
    createKanbanStageController,
    createMessageForBlastController,
    getFunisController,
    getKanbanStagesController
}