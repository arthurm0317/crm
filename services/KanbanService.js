const pool = require("../db/queries");
const { v4: uuidv4 } = require("uuid");

const createKanbanStage = async (name, schema) => {
  const stageExists = await pool.query(
    `SELECT * FROM ${schema}.kanban_vendas WHERE etapa=$1`,
    [name]
  );
  if (stageExists.rowCount > 0) {
    return stageExists.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO ${schema}.kanban_vendas (id, etapa) VALUES ($1, $2) RETURNING *`,
      [uuidv4(), name]
    );
    return result.rows[0];
  }
};

const insertInKanbanStage = async (stageName, connection_id, number, schema) => {
  const stageId = await pool.query(
    `SELECT id FROM ${schema}.kanban_vendas WHERE etapa=$1`,
    [stageName]
  );

  if (stageId.rowCount > 0) {
    const existingChat = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE connection_id=$1 AND contact_phone=$2`,
      [connection_id, number]
    );

    if (existingChat.rowCount > 0) {
      const result = await pool.query(
        `UPDATE ${schema}.chats SET etapa_id=$1 WHERE connection_id=$2 AND contact_phone=$3 RETURNING *`,
        [stageId.rows[0].id, connection_id, number]
      );
      console.log("Chat atualizado:", result.rows[0]);
      return result.rows[0];
    } else {
      const contactName = await pool.query(
        `SELECT contact_name FROM ${schema}.contacts WHERE number=$1`,
        [number]
      );
      const queueId = await pool.query(
        `SELECT * FROM ${schema}.connections WHERE id=$1`,
        [connection_id]
      )
      const newChat = await pool.query(
        `INSERT INTO ${schema}.chats 
         (id, chat_id, connection_id, queue_id, isgroup, contact_name, assigned_user, status, created_at, messages, contact_phone, etapa_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          uuidv4(), 
          `${number}@s.whatsapp.net`, 
          connection_id,
          queueId.rows[0].queue_id,
          false,
          contactName.rows[0]?.contact_name ?? 'Sem nome',
          null,
          null,
          new Date().getTime(), 
          JSON.stringify([]),
          number,
          stageId.rows[0].id
        ]
      );
    return newChat.rows[0];
    }
  } else {
    console.error(`Etapa "${stageName}" não encontrada no esquema "${schema}".`);
    return null;
  }
};

const getChatsInKanbanStage = async (stage, schema) => {
  const stageId = await pool.query(
    `SELECT id FROM ${schema}.kanban_vendas WHERE etapa=$1`,
    [stage]
  );

  if (stageId.rowCount > 0) {
    const result = await pool.query(
      `SELECT * FROM ${schema}.chats WHERE etapa_id=$1`,
      [stageId.rows[0].id]
    );
    return result.rows;
  } else {
    console.error(`Etapa "${stage}" não encontrada no esquema "${schema}".`);
    return [];
  }
};

module.exports = {
  createKanbanStage,
  insertInKanbanStage,
  getChatsInKanbanStage,
};