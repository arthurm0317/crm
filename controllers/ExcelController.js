const XLSX = require('xlsx');
const { processExcelFile } = require('../services/ExcelReader');
const { getInformationFromExcel } = require('../services/ExcelReader');


exports.uploadExcel = async (req, res) => {
  const { setor, schema } = req.body;
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    const rows = data.slice(1);
    const contatos = rows
      .map(row => ({
        nome: row[0]?.toString() || '',
        numero: row[1]?.toString() || '',
        etapa: row[2]?.toString() || ''
      }))
      .filter(contato => contato.nome && contato.numero && contato.etapa);

    await processExcelFile('025de7b9-619d-49ce-a6df-25e79f6043ca', setor, schema);

    res.status(200).json({ message: 'Arquivo enviado e processado com sucesso!', file: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar ou processar arquivo.' });
  }
};