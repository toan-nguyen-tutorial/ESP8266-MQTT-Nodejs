const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


dotenv.config();
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Database connected");
})

const collection = new mongoose.model("users",LoginSchema);
module.exports = collection;