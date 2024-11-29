const bcrypt = require('bcrypt');
const User = require('../models/userModel');  // Make sure this points to your correct User model

const signupController = {
    signup: async (req, res) => {
            const data = {
                name: req.body.username,
                password: req.body.password
            }
            const existingUser = await collection.findOne({name: data.name});
            if (existingUser){
                res.send("already exists");
            }else{
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(data.password, saltRounds);
                data.password = hashedPassword;
                const userdata = await collection.insertMany(data);
                console.log(userdata);
            }
            
    },

    renderSignupForm: (req, res) => {
        res.render('signup', { title: 'Sign Up' });  // Pass title to the view
    }
};

module.exports = signupController;
