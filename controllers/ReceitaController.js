const ReceitaService = require('../services/ReceitaService');

const router = require('express').Router();
const receitaService = new ReceitaService();

// POST /receita - Criar nova receita
router.post('/', async (req, res) => {
    try {
        const { valor, descricao, schema } = req.body;
        
        // Validações
        if (!valor || isNaN(valor)) {
            return res.status(400).json({ 
                success: false,
                error: 'Valor é obrigatório e deve ser numérico.' 
            });
        }

        if (!descricao || descricao.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Descrição é obrigatória.' 
            });
        }

        if (!schema) {
            return res.status(400).json({ 
                success: false,
                error: 'Schema é obrigatório.' 
            });
        }

        await receitaService.initTable();

        const receita = await receitaService.criarReceita({
            descricao: descricao.trim(),
            valor: Number(valor),
            schema: schema
        });
        
        console.log('Receita criada:', receita);
        
        res.status(201).json({
            success: true,
            data: receita
        });
    } catch (error) {
        console.error('Erro ao criar receita:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao criar receita.'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { schema } = req.query;
        
        await receitaService.initTable();
        
        const receitas = await receitaService.listarReceitas({ schema });
        
        console.log(`Listando receitas para schema: ${schema}, total: ${receitas.length}`);
        
        res.json({
            success: true,
            data: receitas
        });
    } catch (error) {
        console.error('Erro ao listar receitas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao listar receitas.'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const receita = await receitaService.buscarReceitaPorId(id);
        
        if (!receita) {
            return res.status(404).json({
                success: false,
                error: 'Receita não encontrada.'
            });
        }
        
        res.json({
            success: true,
            data: receita
        });
    } catch (error) {
        console.error('Erro ao buscar receita:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao buscar receita.'
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;
        
        const receita = await receitaService.atualizarReceita(id, dadosAtualizados);
        
        if (!receita) {
            return res.status(404).json({
                success: false,
                error: 'Receita não encontrada.'
            });
        }
        
        console.log('Receita atualizada:', receita);
        
        res.json({
            success: true,
            data: receita
        });
    } catch (error) {
        console.error('Erro ao atualizar receita:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao atualizar receita.'
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { schema } = req.query;
        
        console.log('Tentando excluir receita:', { id, schema });
        
        if (!schema) {
            console.error('Schema não fornecido na exclusão');
            return res.status(400).json({
                success: false,
                error: 'Schema é obrigatório para exclusão.'
            });
        }
        
        const resultado = await receitaService.removerReceita(id);
        
        if (!resultado) {
            console.error('Receita não encontrada para exclusão:', id);
            return res.status(404).json({
                success: false,
                error: 'Receita não encontrada.'
            });
        }
        
        console.log('Receita removida com sucesso:', id);
        
        res.json({
            success: true,
            message: 'Receita deletada com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao deletar receita:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao deletar receita.'
        });
    }
});

router.get('/stats/:schema', async (req, res) => {
    try {
        const { schema } = req.params;
        const estatisticas = await receitaService.obterEstatisticas(schema);
        
        res.json({
            success: true,
            data: estatisticas
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor ao obter estatísticas.'
        });
    }
});

router.get('/test/connection', async (req, res) => {
    try {
        const conexaoOk = await receitaService.testarConexao();
        
        if (conexaoOk) {
            res.json({
                success: true,
                message: 'Conexão com PostgreSQL OK'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro na conexão com PostgreSQL'
            });
        }
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao testar conexão com banco'
        });
    }
});

module.exports = router;