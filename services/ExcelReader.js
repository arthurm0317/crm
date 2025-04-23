const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

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

  console.log(data);

  fs.unlinkSync(filePath);
  
}

const getInformationFromExcel = async (data, schema) => {
    const result = await pool.query(`
        INSERT INTO ${schema}.chats `)
}
