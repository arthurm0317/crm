const path = require('path');
const multer = require('multer');
const fs = require('fs');

const folderPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, folderPath);
  },
  filename: (req, file, callback) => {
    const time = new Date().getTime();
    callback(null, `${time}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const uploadFileController = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).send('File uploaded successfully.');
};

module.exports = {
  uploadFileController,
  upload, 
};