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

const createTaxRate = async (name, rate, type, is_compound, schema) => {
    const result = await pool.query(`
        INSERT INTO ${schema}.tax_rates (id, name, rate, type, is_compound)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [uuidv4(), name, rate, type, is_compound]
    );
    return result.rows[0];
}

const getTaxRates = async (schema) => {
    const result = await pool.query(`
        SELECT * FROM ${schema}.tax_rates ORDER BY name
    `);
    return result.rows;
}

const getTaxById = async (tax_id, schema) => {
     const result = await pool.query(`
        SELECT * FROM ${schema}.tax_rates WHERE id=$1
    `, [tax_id]);
    return result.rows[0]
}

const insertExpenseItensTax = async (expense_item_id, tax_id, base_amount, schema) => {
    const tax = await getTaxById(tax_id, schema)
    const result = await pool.query(`INSERT INTO ${schema}.expense_item_taxes(id, expense_item_id, tax_rate_id, base_amount, tax_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [uuidv4(), expense_item_id, tax_id, base_amount, (Number(base_amount)*Number(tax.rate)/100)]
    )
    return result.rows[0]
    
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

const getExpensesById = async (expense_id, schema) => {
    console.log(expense_id, schema)
    const expense = await pool.query(`SELECT * FROM ${schema}.expenses WHERE id=$1`, [expense_id]);
    const expense_items = await pool.query(`SELECT * FROM ${schema}.expense_items WHERE expense_id=$1`, [expense_id]);
    let items = [];
    let taxes = [];
    
    for (const item of expense_items.rows) {
        const expense_items_taxes = await pool.query(`SELECT * FROM ${schema}.expense_item_taxes WHERE expense_item_id=$1`, [item.id]);
        
        // Buscar informações completas dos impostos do item
        const itemTaxes = [];
        for (const itemTax of expense_items_taxes.rows) {
            const taxRate = await pool.query(`SELECT * FROM ${schema}.tax_rates WHERE id=$1`, [itemTax.tax_rate_id]);
            if (taxRate.rows[0]) {
                itemTaxes.push({
                    ...itemTax,
                    tax_rate: taxRate.rows[0],
                    tax_name: taxRate.rows[0].name,
                    tax_rate_percentage: taxRate.rows[0].rate,
                    base_amount: itemTax.base_amount,
                    tax_amount: itemTax.tax_amount
                });
            }
        }
        
        items.push({ 
            ...item, 
            taxes: itemTaxes,
            total_with_taxes: item.subtotal + itemTaxes.reduce((sum, tax) => sum + parseFloat(tax.tax_amount || 0), 0)
        });
        
        // Adicionar impostos à lista geral
        taxes.push(...itemTaxes);
    }
    
    return {
        expense: expense.rows[0],
        items: items,
        taxes: taxes
    };
};

const deleteExpense = async (expense_id, schema) => {
    await pool.query(`DELETE FROM ${schema}.expenses WHERE id=$1`, [expense_id])
    await deleteAllExpensesItens(expense_id, schema) 
}

const getExpenseItemById = async (expense_item_id, schema) => {
    const expense_item = await pool.query(`SELECT * FROM ${schema}.expense_items WHERE id=$1`, [expense_item_id]);
    
    if (expense_item.rows.length === 0) {
        return null;
    }
    
    const item = expense_item.rows[0];
    
    // Buscar impostos associados ao item
    const expense_items_taxes = await pool.query(`SELECT * FROM ${schema}.expense_item_taxes WHERE expense_item_id=$1`, [expense_item_id]);
    
    const itemTaxes = [];
    for (const itemTax of expense_items_taxes.rows) {
        const taxRate = await pool.query(`SELECT * FROM ${schema}.tax_rates WHERE id=$1`, [itemTax.tax_rate_id]);
        if (taxRate.rows[0]) {
            itemTaxes.push({
                ...itemTax,
                tax_rate: taxRate.rows[0],
                tax_name: taxRate.rows[0].name,
                tax_rate_percentage: taxRate.rows[0].rate,
                base_amount: itemTax.base_amount,
                tax_amount: itemTax.tax_amount
            });
        }
    }
    
    return {
        ...item,
        taxes: itemTaxes,
        total_with_taxes: item.subtotal + itemTaxes.reduce((sum, tax) => sum + parseFloat(tax.tax_amount || 0), 0)
    };
}

module.exports ={
    createExpense,
    getExpenses,
    getExpensesByCategory,
    deleteAllExpensesItens,
    insertExpenseItens,
    createTaxRate,
    getTaxRates,
    insertExpenseItensTax,
    getExpensesById,
    deleteExpense,
    getExpenseItemById
}