const express = require('express');
const { getPreferencesByUserController, setPreferenceController, updatePreferenceController } = require('../controllers/UserPreferenceController');
const { verifyToken } = require('../controllers/UserController');
const router = express.Router();

router.get('/get-user-preference', verifyToken, getPreferencesByUserController)
router.post('/set-preference', verifyToken, setPreferenceController),
router.put('/update-preference', verifyToken, updatePreferenceController)

module.exports = router