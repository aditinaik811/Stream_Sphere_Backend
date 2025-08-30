const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video')
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret:process.env.API_SECRET 
});


router.post('/upload-video',checkAuth,async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const user = await jwt.verify(token,process.env.JWT_TOKEN)
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{ resource_type:'video'})
        const uploadedthumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
        const newVideo = new Video({
               _id:new mongoose.Types.ObjectId,
                title:req.body.title,
                description:req.body.description,
                user_id:user._id,
                videoUrl:uploadedVideo.secure_url,
                videoId:uploadedVideo.public_id,
                thumbnailUrl:uploadedVideo.secure_url,
                thumbnailId:uploadedthumbnail.public_id,
                category:req.body.category,
                tags:req.body.tags.split(","),
           })
           const newUploadedVideoData = await newVideo.save() 
           res.status(200).json({
            newVideo:newUploadedVideoData
           })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})
module.exports = router