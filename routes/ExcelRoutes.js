
const express = require('express');
const multer = require('multer');
const path = require('path');
const { processExcelFile } = require('../services/ExcelReader');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const mapping = JSON.parse(req.body.mapping); 
    const schema = req.body.schema;
    const funil = req.body.funil;
    await processExcelFile(req.file.path, mapping, schema, funil);
    res.status(200).json({ message: 'Arquivo enviado com sucesso!', file: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar arquivo.' });
  }
});

module.exports = router;