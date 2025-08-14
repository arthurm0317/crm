const pool = require('../db/queries');

class ReceitaService {
    constructor() {
        this.pool = pool;
        this.tableName = 'receitas'; 
        console.log('ReceitaService inicializado, pool:', !!this.pool);
    }

    
    async initTable() {
        try {
            console.log('Tentando inicializar tabela:', this.tableName);
            
            await this.testarConexao();
            
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id SERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    valor_receita NUMERIC(10,2) NOT NULL,
                    schema_name TEXT,
                    status TEXT DEFAULT 'ativo',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            
            console.log('Query de criação:', createTableQuery);
            const result = await this.pool.query(createTableQuery);
            console.log('Tabela criada/verificada com sucesso');
            
            const checkQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const checkResult = await this.pool.query(checkQuery);
            console.log('Total de registros na tabela:', checkResult.rows[0].total);
            
        } catch (error) {
            console.error('Erro ao inicializar tabela de receitas:', error);
            throw error;
        }
    }

    async criarReceita(dadosReceita) {
        try {
            console.log('Tentando criar receita:', dadosReceita);
            const { descricao, valor, schema } = dadosReceita;
            
            const query = `
                INSERT INTO ${this.tableName} (nome, valor_receita, schema_name, status)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [descricao, valor, schema, 'ativo'];
            console.log('Query:', query);
            console.log('Values:', values);
            
            const result = await this.pool.query(query, values);
            console.log('Receita criada com sucesso:', result.rows[0]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar receita:', error);
            throw error;
        }
    }

    async listarReceitas(filtros = {}) {
        try {
            let query = `SELECT * FROM ${this.tableName}`;
            let values = [];
            let whereClauses = [];
            let paramIndex = 1;

            if (!filtros.includeInactive) {
                whereClauses.push(`status = 'ativo'`);
            }

        
            if (filtros.schema) {
                whereClauses.push(`schema_name = $${paramIndex}`);
                values.push(filtros.schema);
                paramIndex++;
            }

            if (filtros.status) {
                whereClauses.push(`status = $${paramIndex}`);
                values.push(filtros.status);
                paramIndex++;
            }

            if (whereClauses.length > 0) {
                query += ` WHERE ${whereClauses.join(' AND ')}`;
            }

            query += ` ORDER BY created_at DESC`;

            console.log('Query de listagem:', query);
            console.log('Values:', values);
            
            const result = await this.pool.query(query, values);
            console.log('Receitas encontradas:', result.rows.length);
            return result.rows;
        } catch (error) {
            console.error('Erro ao listar receitas:', error);
            throw error;
        }
    }

    async buscarReceitaPorId(id) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
            const result = await this.pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar receita por ID:', error);
            throw error;
        }
    }

    async atualizarReceita(id, dadosAtualizados) {
        try {
            const { descricao, valor, status } = dadosAtualizados;
            
            const query = `
                UPDATE ${this.tableName} 
                SET nome = COALESCE($1, nome), 
                    valor_receita = COALESCE($2, valor_receita), 
                    status = COALESCE($3, status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `;
            
            const values = [descricao, valor, status, id];
            const result = await this.pool.query(query, values);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar receita:', error);
            throw error;
        }
    }

    async removerReceita(id) {
        try {
            console.log('Tentando remover receita com ID:', id);
            
            const query = `
                UPDATE ${this.tableName} 
                SET status = 'inativo', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            
            console.log('Query de remoção:', query);
            console.log('ID para remoção:', id);
            
            const result = await this.pool.query(query, [id]);
            
            console.log('Resultado da remoção:', result.rows);
            
            if (result.rows.length === 0) {
                console.log('Nenhuma receita encontrada com ID:', id);
                return false;
            }
            
            console.log('Receita removida com sucesso:', result.rows[0]);
            return true;
        } catch (error) {
            console.error('Erro ao remover receita:', error);
            throw error;
        }
    }

    async obterEstatisticas(schema) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_receitas,
                    SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as receitas_ativas,
                    SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as receitas_inativas,
                    SUM(CASE WHEN status = 'ativo' THEN valor_receita ELSE 0 END) as valor_total_ativas
                FROM ${this.tableName}
                WHERE schema_name = $1
            `;
            
            const result = await this.pool.query(query, [schema]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }

    async testarConexao() {
        try {
            console.log('Testando conexão com PostgreSQL...');
            const result = await this.pool.query('SELECT NOW() as current_time, version() as db_version');
            console.log('Conexão OK - Tempo atual:', result.rows[0].current_time);
            console.log('Versão do banco:', result.rows[0].db_version);
            return true;
        } catch (error) {
            console.error('Erro na conexão com PostgreSQL:', error);
            return false;
        }
    }
}

module.exports = ReceitaService;