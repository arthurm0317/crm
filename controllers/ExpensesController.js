const { createExpense, getExpenses, deleteAllExpensesItens, insertExpenseItens } = require("../services/ExpensesService");

const createExpenseController = async (req, res) => {
    const {user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at, itens=[], schema } = req.body;
    console.log(req.body)
    try {
        const result = await createExpense(user_id, vendor_id, description, category_id, total_amount, currency, date_incurred, due_date, payment_date, payment_method, status, created_at, schema);
         await deleteAllExpensesItens(result.id, schema)
         for(const item of itens){
            const todosImpostos = item.tax
            console.log(todosImpostos)
            await insertExpenseItens(result.id, item.quantidade, item.unit_price, item.hasTax, schema)
         }
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getExpensesController = async (req, res) => {
    const schema = req.params.schema;

    try {
        const expenses = await getExpenses(schema);
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createExpenseController,
    getExpensesController
};