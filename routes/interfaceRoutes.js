const express = require('express');
const router = express.Router();
const interfaceController = require('../controllers/interfaceController'); // Import đúng file

// Route for interface page
router.get('/', interfaceController.getInterfacePage); // Đảm bảo hàm getInterfacePage được export từ controller

module.exports = router;
