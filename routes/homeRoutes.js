const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Route for homepage
router.get('/', homeController.getHomePage);

module.exports = router;
