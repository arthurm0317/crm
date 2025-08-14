const { createReceita, getReceitas, getReceitaById, updateReceita, deleteReceita, getReceitasStats, testConnection } = require("../services/ReceitaService");

const createReceitaController = async (req, res) => {
    const { nome, valor_receita, schema, status } = req.body;
    console.log(req.body)
    try {
        const result = await createReceita(nome, valor_receita, schema, 'ativo');
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getReceitasController = async (req, res) => {
    const { schema } = req.params;
    const { includeInactive } = req.query;
    
    try {
        const receitas = await getReceitas(schema, includeInactive === 'true');
        res.status(200).json({ success: true, data: receitas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getReceitaByIdController = async (req, res) => {
    const { receita_id, schema } = req.params;
    
    try {
        const result = await getReceitaById(receita_id, schema);
        
        if (!result) {
            return res.status(404).json({ success: false, message: 'Receita não encontrada' });
        }
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateReceitaController = async (req, res) => {
    const { receita_id, schema } = req.params;
    const { nome, valor_receita, status } = req.body;
    
    try {
        const result = await updateReceita(receita_id, nome, valor_receita, status, schema);
        
        if (!result) {
            return res.status(404).json({ success: false, message: 'Receita não encontrada' });
        }
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteReceitaController = async (req, res) => {
    const { receita_id, schema } = req.body;
    
    try {
        const result = await deleteReceita(receita_id, schema);
        
        if (!result) {
            return res.status(404).json({ success: false, message: 'Receita não encontrada' });
        }
        
        res.status(200).json({ success: true, message: 'Receita removida com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getReceitasStatsController = async (req, res) => {
    const { schema } = req.params;
    
    try {
        const stats = await getReceitasStats(schema);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const testConnectionController = async (req, res) => {
    try {
        const result = await testConnection();
        res.status(200).json({ success: true, data: { connected: result } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createReceitaController,
    getReceitasController,
    getReceitaByIdController,
    updateReceitaController,
    deleteReceitaController,
    getReceitasStatsController,
    testConnectionController
};