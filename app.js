const express = require('express')
const app = express();
const router = express.Router();
const mongoose = require('mongoose')
require('dotenv').config()
const userRoute = require('./routes/user');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

    
    
const connectWithDatabase = async () =>{
    try
    {
       const res = await mongoose.connect(process.env.MONGO_URI)
       console.log("Successfully connected with Databse");
    }
    catch(err){
        console.log(err)
    }

}
connectWithDatabase()
app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles:true
}));


app.use('/user',userRoute)

module.exports = app;