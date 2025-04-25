const pool = require("../db/queries")
const { v4: uuidv4 } = require('uuid');

const createKanbanStage = async (name, schema) => {
    const stageExists = await pool.query(
        `SELECT * FROM ${schema}.kanban_vendas WHERE etapa=$1`, [name]

    )
    if (stageExists.rowCount > 0) {
        return stageExists.rows[0]
    } else {
        const result = await pool.query(`INSERT INTO ${schema}.kanban_vendas (id, etapa) VALUES ($1, $2)`,
            [
                uuidv4(),
                name
            ]
        );
        return result.rows[0]
    }
}

const insertInKanbanStage = async(stageName, connection_id, number, schema)=>{
    console.log(stageName)
    const stageId = await pool.query(
        `SELECT id FROM ${schema}.kanban_vendas WHERE etapa=$1`, [stageName]
    )
    if(stageId.rowCount>0){
        const result = await pool.query(`UPDATE ${schema}.chats SET etapa_id=$1 WHERE connection_id=$2 AND contact_phone=$3`,
        [
            stageId.rows[0].id,
            connection_id,
            number
        ]
        );
        return result.rows[0]
    }
}

module.exports = {
    createKanbanStage,
    insertInKanbanStage
}