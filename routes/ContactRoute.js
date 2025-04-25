const express = require('express');
const { createCustomFieldController, insertValueCustomFieldController } = require('../controllers/ContactController');
const router = express.Router();

router.post('/create-field', createCustomFieldController)
router.post('/insert-value', insertValueCustomFieldController)

module.exports = router;