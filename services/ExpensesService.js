const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');

const createExpense = async(user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at, schema)=>{
    const result = await pool.query(
        `INSERT INTO ${schema}.expenses (id, user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [uuidv4(), user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at || new Date().toISOString()]
    )
    return result.rows[0];
}

const deleteAllExpensesItens = async (expense_id, schema) => {
    const result = await pool.query(
        `DELETE FROM ${schema}.expense_items WHERE expense_id = $1 RETURNING *`,
        [expense_id]
    );
    return result.rows;
}

const insertExpenseItens = async(expense_id, quantity, unit_price, tax_included, schema)=>{
    
    const result = await pool.query(`
        INSERT INTO ${schema}.expense_items (id, expense_id, quantity, unit_price, subtotal, tax_included)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [uuidv4(), expense_id, quantity, unit_price, unit_price*quantity, tax_included]
    );
    return result.rows[0];
}

const getExpenses = async(schema)=>{
    const result = await pool.query(
        `SELECT e.*, c.category_name, v.vendor_name
         FROM ${schema}.expenses e
         LEFT JOIN ${schema}.category c ON e.category_id = c.id
         LEFT JOIN ${schema}.vendors v ON e.vendor_id = v.id`
    );
    return result.rows;
}

const getExpensesByCategory = async(category_id, schema)=>{
    const result = await pool.query(
        `SELECT * FROM ${schema}.expenses WHERE category_id = $1`,
        [category_id]
    );
    return result.rows;
}

module.exports ={
    createExpense,
    getExpenses,
    getExpensesByCategory,
    deleteAllExpensesItens,
    insertExpenseItens
}