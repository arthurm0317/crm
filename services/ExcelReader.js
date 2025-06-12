
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const pool = require("../db/queries")
const { insertValueCustomField } = require('./ContactService');
const { insertInKanbanStage } = require('./KanbanService');

const folderPath = path.join(__dirname, '..', 'uploads');


const XLSX = require('xlsx');

async function processExcelFile(filePath, mapping, schema, funil) {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

  const headers = data[0];
  const rows = data.slice(1);

  for (const row of rows) {
    let contato = {};
    Object.entries(mapping).forEach(([colIdx, crmField]) => {
      if (crmField) {
        contato[crmField] = row[colIdx];
      }
    });

  }
}

const getInformationFromExcel = async (data, connection, sector, schema) => {
  for (const row of data) {
    let numero = row.numero?.toString();
    const nomeSeparado = row.nome.split(' ');
    const etapa = row.etapa;

    const nome = nomeSeparado
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

    if (!numero || !nome) {
      console.warn('Linha ignorada: número ou nome ausente.', row);
      continue;
    }
    if (!numero.startsWith('55')) {
      numero = `55${numero}`;
    }

    try {
      await pool.query(
        `INSERT INTO ${schema}.contacts (number, contact_name) VALUES ($1, $2)
         ON CONFLICT (number) DO NOTHING`,
        [numero, nome]
      );
      console.log(`Contato inserido ou já existente: ${numero} - ${nome}`);
      for (const [key, value] of Object.entries(row)) {
        if (key !== 'numero' && key !== 'nome' && key !== 'etapa') {
          await insertValueCustomField(key, numero, value, schema);
        }
      }
      if (etapa) {
        await insertInKanbanStage(etapa, connection, sector, numero, schema);
        console.log(`Contato ${numero} inserido na etapa ${etapa}`);
      }
    } catch (error) {
      console.error(`Erro ao processar linha: ${JSON.stringify(row)}`, error);
    }
  }
};

module.exports = {
  processExcelFile,
  getInformationFromExcel
};