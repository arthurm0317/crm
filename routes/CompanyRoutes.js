const express = require('express');
const { createCompanyController, getAllCompaniesController } = require('../controllers/CompanyController');

const router = express.Router();

router.post('/company', createCompanyController)
router.get('/companies', getAllCompaniesController)

module.exports = router