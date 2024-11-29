const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Route for homepage
router.get('/', loginController.getLoginPage);

module.exports = router;
