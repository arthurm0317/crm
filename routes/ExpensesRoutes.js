const express = require('express');
const { verifyToken } = require('../controllers/UserController');
const { getExpensesController, createExpenseController } = require('../controllers/ExpensesController');
const router = express.Router();

router.get('/get-expenses/:schema', verifyToken, getExpensesController);
router.post('/create-expense', verifyToken, createExpenseController);

module.exports = router;