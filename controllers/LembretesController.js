const { createLembrete, getLembretes, updateLembretes, deleteLembrete } = require("../services/LembreteService")

const createLembreteController = async (req, res) => {
    const {lembrete_name, tag, message, date, schema} = req.body
    try {
        const result = await createLembrete(lembrete_name, tag, message, date, schema)
        res.status(201).json(result);

    } catch (error) {
        console.error(error)
    }
}

const getLembretesController = async (req, res) => {
    const {schema} = req.params
    try {
        const result = await getLembretes(schema)
        res.status(201).json(result);
    } catch (error) {
        console.error(error)
    }
}
const updateLembretesController = async (req, res) => {
    const {id, lembrete_name, tag, message, date, icone, schema} = req.body
    try {
        const result = await updateLembretes(id, lembrete_name, tag, message, date, icone, schema)
        res.status(201).json(result);
    } catch (error) {
        console.error(error)
    }
}

const deleteLembreteController = async (req, res) => {
    console.log(req.body)
    const {id, schema} = req.body
    try {
        const result = await deleteLembrete(id, schema)
        res.status(201).json(result);
    } catch (error) {
        console.error(error)
    }

}

module.exports = {
    createLembreteController,
    getLembretesController,
    updateLembretesController,
    deleteLembreteController
}