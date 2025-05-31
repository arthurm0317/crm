const express = require('express');
const { chatgptText } = require('../controllers/ChatgptController');
const router = express.Router();

router.post('/', chatgptText);


module.exports = router;