const express = require('express')
const app = express();
const router = express.Router();
const mongoose = require('mongoose')
const userRoute = require('./routes/user')
const videoRoute = require('./routes/video')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

    
    
const connectWithDatabase = async () =>{
    try
    {
       const res = await mongoose.connect(process.env.MONGO_URI)
       console.log("Successfully connected with Database");
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
app.use('/video',videoRoute)


module.exports = app;