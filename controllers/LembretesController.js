const { createLembrete, getLembretes, updateLembretes, deleteLembrete } = require("../services/LembreteService")

const createLembreteController = async (req, res) => {
    console.log(req.body)
    const {lembrete_name, tag, message, date, icone, user_id, schema, filas} = req.body

    try {
        const result = await createLembrete(lembrete_name, tag, message, date, icone, user_id, schema, filas)
        res.status(201).json(result);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao criar lembrete' });
    }
}

const getLembretesController = async (req, res) => {
    const {schema} = req.params
    try {
        const result = await getLembretes(schema)
        res.status(200).json(result);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao buscar lembretes' });
    }
}

const updateLembretesController = async (req, res) => {
    const {id, lembrete_name, tag, message, date, icone, schema, filas} = req.body
    try {
        const result = await updateLembretes(id, lembrete_name, tag, message, date, icone, schema, filas)
        res.status(200).json(result);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao atualizar lembrete' });
    }
}

const deleteLembreteController = async (req, res) => {
    console.log(req.body)
    const {id, schema} = req.body
    try {
        const result = await deleteLembrete(id, schema)
        res.status(200).json(result);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao deletar lembrete' });
    }
}

module.exports = {
    createLembreteController,
    getLembretesController,
    updateLembretesController,
    deleteLembreteController
}