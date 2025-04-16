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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.chats (
              id UUID PRIMARY KEY,
              chat_id TEXT,
              connection_id TEXT,
              queue_id UUID,
              isGroup BOOLEAN,
              contact_name TEXT,
              assigned_user TEXT,
              status TEXT,
              created_at BIGINT,
              messages JSONB
            );
          `);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${schema}.queues(
            id UUID PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            color TEXT,
            users JSONB
        );`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.connections (
              id UUID PRIMARY KEY,
              name TEXT NOT NULL,
              number TEXT NOT NULL
            );
          `);
        await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.messages (
            id UUID PRIMARY KEY,
            body TEXT,
            from_me BOOLEAN,
            chat_id UUID,
            created_at BIGINT
        );
        `);
        await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.last_assigned_user (
            queue_id UUID REFERENCES ${schema}.queues(id) ON DELETE CASCADE,
            user_id UUID REFERENCES ${schema}.users(id) ON DELETE CASCADE,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (queue_id, user_id)
        );
        `);
    
        await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.queue_users (
            user_id UUID REFERENCES ${schema}.users(id) ON DELETE CASCADE,
            queue_id UUID REFERENCES ${schema}.queues(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, queue_id)
        );
        `);
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