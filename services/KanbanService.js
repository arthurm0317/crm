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
  console.log("Inserindo na etapa:", stageName);
  const stageId = await pool.query(
    `SELECT id FROM ${schema}.kanban_vendas WHERE etapa=$1`,
    [stageName]
  );

  if (stageId.rowCount > 0) {
    const result = await pool.query(
      `UPDATE ${schema}.chats SET etapa_id=$1 WHERE connection_id=$2 AND contact_phone=$3 RETURNING *`,
      [stageId.rows[0].id, connection_id, number]
    );
    return result.rows[0];
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