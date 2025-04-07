const { Users } = require('../entities/Users');
const { v4: uuidv4 } = require('uuid');
const { createUser } = require('./UserService');
const  pool  = require('../db/queries'); 

const createCompany = async (company) => {
    const schema = company.name.toLowerCase();
    const superAdminId = uuidv4();
    const superAdminData = company.superAdmin;

    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.users (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            permission TEXT,
            online BOOLEAN DEFAULT false
        );`);
    const superAdmin = new Users(
        superAdminId,
        superAdminData.name,
        superAdminData.email,
        superAdminData.password,
        'admin'
    );

    await createUser(superAdmin, schema);

    return { message: "Empresa criada com sucesso!" };
};

const getAllCompanies = async () => {
    const result = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    `);
    return result.rows;
};

module.exports = { createCompany, getAllCompanies };