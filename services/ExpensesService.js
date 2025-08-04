const pool = require('../db/queries');
const { v4: uuidv4 } = require('uuid');

const createExpense = async(user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at, schema)=>{
    const result = await pool.query(
        `INSERT INTO ${schema}.expenses (id, user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [uuidv4(), user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at]
    )
    return result.rows[0];
}

module.exports ={
    createExpense
}