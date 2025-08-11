const express = require('express');
const { verifyToken } = require('../controllers/UserController');
const { getExpensesController, createExpenseController, createTaxRateController, getTaxRatesController, getExpensesByIdController, deleteExpenseController } = require('../controllers/ExpensesController');
const router = express.Router();

router.get('/get-expenses/:schema', verifyToken, getExpensesController);
router.get('/get-expense/:expense_id/:schema', verifyToken, getExpensesByIdController);
router.get('/get-tax-rates/:schema', verifyToken, getTaxRatesController);
router.post('/create-expense', verifyToken, createExpenseController);
router.post('/create-tax-rate', verifyToken, createTaxRateController);
router.delete('/delete-expense', verifyToken, deleteExpenseController)

module.exports = router;