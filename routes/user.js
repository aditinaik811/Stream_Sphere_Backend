const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt');
const  mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret:process.env.API_SECRET 
});
router.post('/signup',async(req,res)=>{
    try
    {
        const users = await User.find({email:req.body.email})
        if(users.length>0){
            res.status(500).json({
                error:"Email ALready Registered"
            })
        }
        const hashcode = await bcrypt.hash(req.body.password,10)
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        const newUser = new User({
            _id: new mongoose.Types.ObjectId,
            channelName:req.body.channelName,
            email:req.body.email,
            phone:req.body.phone,
            password:hashcode,
            logoUrl:uploadedImage.secure_url,
            logoId:uploadedImage.public_id
        })
        const user = await newUser.save()
        res.status(200).json({
            newUser:user
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})




module.exports = router