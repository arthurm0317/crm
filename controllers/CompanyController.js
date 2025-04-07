const { v4: uuidv4 } = require('uuid');
const { Company } = require('../entities/company');
const { createCompany } = require('../services/CompanyService');

const createCompanyController = async (req, res) => {
    try {
        const { name, superAdmin } = req.body;

        const newCompany = new Company(uuidv4(), name, superAdmin);
        const result = await createCompany(newCompany); 

        res.status(201).json({
            message: 'Empresa criada',
            company: result
        });
    } catch (error) {
        console.error("Erro ao criar empresa:", error.message);
        res.status(500).json({
            message: 'Erro ao criar empresa'
        });
    }
};

module.exports = { createCompanyController };