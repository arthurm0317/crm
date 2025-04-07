const express = require('express');
const { createCompanyController } = require('../controllers/CompanyController');

const router = express.Router();

router.post('/company', createCompanyController)

module.exports = router