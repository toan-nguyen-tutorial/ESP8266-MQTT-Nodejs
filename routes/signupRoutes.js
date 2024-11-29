const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signupController');

// Route to display the signup form
router.get('/signup', signupController.renderSignupForm);

// Route to handle the signup form submission
router.post('/signup', signupController.signup);

module.exports = router;
