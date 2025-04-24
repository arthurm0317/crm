const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const pool = require("../db/queries")
const { v4: uuidv4 } = require('uuid');
const { insertValueCustomField } = require('./ContactService');

const folderPath = path.join(__dirname, '..', 'uploads');

function processExcelFile() {
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.xlsx'));

  if (files.length === 0) {
    console.log('Nenhum arquivo .xlsx encontrado.');
    return;
  }

  const filePath = path.join(folderPath, files[0]); 
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; 
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  getInformationFromExcel(data, 'effective_gain')

  // fs.unlinkSync(filePath);
  
}

const getInformationFromExcel = async (data, schema) => {
  console.log(data);

  for (const row of data) {
    const numero = row.numero?.toString();
    const nome = row.nome;

    if (!numero || !nome) {
      continue;
    }

    try {
      await pool.query(
        `INSERT INTO ${schema}.contacts (number, contact_name) VALUES ($1, $2)
         ON CONFLICT (number) DO NOTHING`,
        [numero, nome]
      );

      for (const [key, value] of Object.entries(row)) {
        if (key !== 'numero' && key !== 'nome') {
          await insertValueCustomField(key, numero, value, schema)
        }
      }
    } catch (error) {
      console.error(`Erro ao inserir contato ou campo personalizado:`, error);
    }
  }
};

module.exports = {
  processExcelFile,
  getInformationFromExcel
};