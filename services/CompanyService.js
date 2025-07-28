const { Users } = require('../entities/Users');
const { v4: uuidv4 } = require('uuid');
const { createUser } = require('./UserService');
const  pool  = require('../db/queries'); 

const createCompany = async (company, schema) => {
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
            online BOOLEAN DEFAULT false,
            sector text
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
              messages JSONB,
              contact_phone text,
              etapa_id uuid,
              updated_time bigint,
              unreadmessages boolean
            );
          `);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${schema}.queues(
            id UUID PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            color TEXT,
            users JSONB,
            distribution boolean,
            superuser uuid REFERENCES ${schema}.users(id) ON DELETE SET NULL
        );`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.connections (
              id UUID PRIMARY KEY,
              name TEXT NOT NULL,
              number TEXT NOT NULL,
              queue_id uuid
            );
          `);
        await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.messages (
            id text PRIMARY KEY,
            body TEXT,
            from_me BOOLEAN,
            chat_id UUID,
            created_at BIGINT,
            message_type text,
            base64 text,
            isquoted boolean,
            quote_id text
        );
        `);
        await pool.query(`
             CREATE TABLE IF NOT EXISTS ${schema}.contacts (
             number text not null primary key,
             contact_name text
             )
            `)
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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.custom_fields (
            id UUID PRIMARY KEY,
            field_name TEXT NOT NULL,
            label TEXT NOT NULL,
            UNIQUE(field_name),
            graph boolean default false
            );
            `)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.contact_custom_values (id UUID PRIMARY KEY,
            contact_number TEXT NOT NULL REFERENCES ${schema}.contacts(number) ON DELETE CASCADE,
            field_id UUID NOT NULL REFERENCES ${schema}.custom_fields(id) ON DELETE CASCADE,
            value TEXT,
            UNIQUE(contact_number, field_id)
            );
        `)
        await pool.query(`
            create table IF NOT EXISTS ${schema}.message_blast(
            id uuid primary key not null,
            value text not null,
            sector text not null,
            campaing_id uuid,
            image text
            )
        `)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.tag(
            id UUID PRIMARY KEY,
            name text NOT NULL,
            color text
            );

            `)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS ${schema}.chat_tag (
            chat_id UUID NOT NULL,
            tag_id UUID NOT NULL,
            PRIMARY KEY (chat_id, tag_id),
            FOREIGN KEY (chat_id) REFERENCES ${schema}.chats(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES ${schema}.tag(id) ON DELETE CASCADE
            );`
        )
        await pool.query(`
            create table IF NOT EXISTS ${schema}.campaing(
            id UUID primary key,
            campaing_name text not null,
            sector text not null,
            kanban_stage UUID not null,
            start_date bigint,
            status text,
            timer bigint,
            min bigint,
            max bigint
            )
            `)
        await pool.query(
            `create table IF NOT EXISTS ${schema}.lembretes(
            id uuid primary key not null,
            lembrete_name text not null,
            tag text,
            message text,
            date bigint,
            icone text,
            user_id uuid references ${schema}.users(id) on delete set null,
            google_event_id text
            )`
        )
        await pool.query(`
                CREATE TABLE IF NOT EXISTS ${schema}.lembretes_queues (
                lembrete_id UUID NOT NULL,
                queue_id UUID NOT NULL,
                PRIMARY KEY (lembrete_id, queue_id),
                FOREIGN KEY (lembrete_id) REFERENCES ${schema}.lembretes(id) ON DELETE CASCADE,
                FOREIGN KEY (queue_id) REFERENCES ${schema}.queues(id) ON DELETE CASCADE
                )`
        );
        await pool.query(
            `CREATE TABLE IF NOT EXISTS ${schema}.scheduled_message (
            id UUID PRIMARY KEY,
            message TEXT NOT NULL,
            chat_id UUID NOT NULL REFERENCES ${schema}.chats(id) ON DELETE CASCADE,
            scheduled_date BIGINT NOT NULL
            );`
        )
        await pool.query(`CREATE TABLE IF NOT EXISTS ${schema}.user_preferences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES ${schema}.users(id),
        key text NOT NULL,
        value text,
        CONSTRAINT user_preferences_user_key_unique UNIQUE (user_id, key)
        );`)

        await pool.query(`CREATE TABLE IF NOT EXISTS ${schema}.quick_messages (
                    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    tag text NOT NULL,
                    queue_id uuid REFERENCES ${schema}.queues(id) ON DELETE SET NULL,
                    user_id uuid REFERENCES ${schema}.users(id) ON DELETE SET NULL,
                    value text,
                    is_command_on boolean NOT NULL DEFAULT false,
                    shortcut text
        );`)
        await pool.query(`CREATE TABLE IF NOT EXISTS ${schema}.campaing_connections (
                    campaing_id UUID NOT NULL,
                    connection_id UUID,
                    CONSTRAINT unique_pair UNIQUE (campaing_id, connection_id)
        );`)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.contacts_stage (
            contact_number text NOT NULL REFERENCES ${schema}.contacts(number) ON DELETE CASCADE,
            stage UUID NOT NULL,
            PRIMARY KEY (contact_number, stage)
            );
        `)
        await pool.query(`
            CREATE TABLE ${schema}.kanban_preferences (
            sector TEXT primary key NOT NULL,
            label TEXT,
            color TEXT NOT NULL
            );
        `)
        await pool.query(`
            CREATE TABLE ${schema}.chat_contact (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            chat_id UUID NOT NULL REFERENCES ${schema}.chats(id) ON DELETE CASCADE,
            user_id uuid references effective_gain.users(id) on delete set null,
            contact_number TEXT NOT NULL,
            status TEXT,
            custom_field UUID REFERENCES ${schema}.custom_fields(id), 
            custom_value TEXT, 
            closed_at TIMESTAMP DEFAULT now()
            );
        `)
        await pool.query(`
            CREATE TABLE ${schema}.status(
            id uuid primary key,
            value text not null,
            success boolean
            )    
        `)
        await pool.query(`
            CREATE TABLE ${schema}.reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            chat_id UUID REFERENCES ${schema}.chats(id),
            user_id UUID,
            queue_id UUID,
            categoria TEXT NOT NULL,
            resumo TEXT NOT NULL,
            assertividade TEXT NOT NULL,
            status TEXT NOT NULL,
            proxima_etapa TEXT NOT NULL
            );
        `)



    const superAdmin = new Users(
        superAdminId,
        superAdminData.name,
        superAdminData.email,
        superAdminData.password,
        'admin'
    );

    await createUser(superAdmin, schema);

    await pool.query('INSERT INTO effective_gain.companies (company_name, schema_name) VALUES ($1, $2)', [
        company.name,
        schema
    ]);

    return { message: "Empresa criada com sucesso!" };
};

const getAllCompanies = async () => {
    const result = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'public')
    `);
    return result.rows;
};
const getAllCompaniesTecUser = async () => {
    try{
        const result = await pool.query(
            `SELECT * FROM effective_gain.companies`
        )
        return result.rows
    }catch(error){
        console.error(error)
        throw new Error("Erro ao buscar empresas")
    }
}
module.exports = { createCompany, getAllCompanies, getAllCompaniesTecUser };