const express = require('express');
const { getPreferencesByUserController, setPreferenceController, updatePreferenceController } = require('../controllers/UserPreferenceController');
const router = express.Router();

router.get('/get-user-preference', getPreferencesByUserController)
router.post('/set-preference', setPreferenceController),
router.put('/update-preference', updatePreferenceController)

module.exports = router