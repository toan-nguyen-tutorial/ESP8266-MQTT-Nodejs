const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,  // Ensure unique constraint on username
        trim: true  // Trim any leading/trailing spaces
    },
    password: { 
        type: String, 
        required: true 
    }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
