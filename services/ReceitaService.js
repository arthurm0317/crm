const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');

const createReceita = async (nome, valor_receita, schema_name, status = 'ativo') => {
    const result = await pool.query(
        `INSERT INTO ${schema_name}.receitas (id, nome, valor_receita, schema_name, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [uuidv4(), nome, valor_receita, schema_name, status, new Date().toISOString()]
    );
    return result.rows[0];
};

const getReceitas = async (schema, includeInactive = false) => {
    let query = `SELECT * FROM ${schema}.receitas`;
    let values = [];
    
    if (!includeInactive) {
        query += ` WHERE status = 'ativo'`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
};

const getReceitaById = async (receita_id, schema) => {
    const result = await pool.query(
        `SELECT * FROM ${schema}.receitas WHERE id = $1`,
        [receita_id]
    );
    
    if (result.rows.length === 0) {
        return null;
    }
    
    return result.rows[0];
};

const updateReceita = async (receita_id, nome, valor_receita, status, schema) => {
    const result = await pool.query(
        `UPDATE ${schema}.receitas 
         SET nome = COALESCE($1, nome), 
             valor_receita = COALESCE($2, valor_receita), 
             status = COALESCE($3, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [nome, valor_receita, status, receita_id]
    );
    
    if (result.rows.length === 0) {
        return null;
    }
    
    return result.rows[0];
};

const deleteReceita = async (receita_id, schema) => {
    const result = await pool.query(
        `UPDATE ${schema}.receitas 
         SET status = 'inativo', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [receita_id]
    );
    
    if (result.rows.length === 0) {
        return false;
    }
    
    return true;
};

const getReceitasStats = async (schema) => {
    const result = await pool.query(
        `SELECT 
            COUNT(*) as total_receitas,
            SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as receitas_ativas,
            SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as receitas_inativas,
            SUM(CASE WHEN status = 'ativo' THEN valor_receita ELSE 0 END) as valor_total_ativas
         FROM ${schema}.receitas`
    );
    return result.rows[0];
};

const testConnection = async () => {
    try {
        console.log('Testando conexão com PostgreSQL...');
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('Conexão OK - Tempo atual:', result.rows[0].current_time);
        console.log('Versão do banco:', result.rows[0].db_version);
        return true;
    } catch (error) {
        console.error('Erro na conexão com PostgreSQL:', error);
        return false;
    }
};

module.exports = {
    createReceita,
    getReceitas,
    getReceitaById,
    updateReceita,
    deleteReceita,
    getReceitasStats,
    testConnection
};