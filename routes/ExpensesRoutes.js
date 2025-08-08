const express = require('express');
const { verifyToken } = require('../controllers/UserController');
const { getExpensesController, createExpenseController, createTaxRateController, getTaxRatesController } = require('../controllers/ExpensesController');
const router = express.Router();

router.get('/get-expenses/:schema', verifyToken, getExpensesController);
router.post('/create-expense', verifyToken, createExpenseController);
router.get('/get-tax-rates/:schema', verifyToken, getTaxRatesController);
router.post('/create-tax-rate', verifyToken, createTaxRateController);

module.exports = router;