const { v4: uuidv4 } = require('uuid');
const { Company } = require('../entities/company');
const { createCompany, getAllCompanies } = require('../services/CompanyService');

const createCompanyController = async (req, res) => {
    try {
        const { name, superAdmin } = req.body;

        const newCompany = new Company(uuidv4(), name, superAdmin);
        const result = await createCompany(newCompany); 

        res.status(201).json({
            message: 'Empresa criada'
        });
    } catch (error) {
        console.error("Erro ao criar empresa:", error.message);
        res.status(500).json({
            message: 'Erro ao criar empresa'
        });
    }
};

const getAllCompaniesController = async(req, res)=>{
    try{
        const result = await getAllCompanies();
        res.status(201).json({
            empresas: result
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Erro ao buscar empresas"
        })
    }
}

module.exports = { createCompanyController, getAllCompaniesController };