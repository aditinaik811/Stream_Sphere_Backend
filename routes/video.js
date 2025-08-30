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
                thumbnailUrl:uploadedthumbnail.secure_url,
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


router.put('/:videoId',checkAuth, async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN)
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        if(video.user_id = verifiedUser._id){
            if(req.files)
            {
                await cloudinary.uploader.destroy(video.thumbnailId)
                const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updatedData = {
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(","),
                    thumbnailUrl:updatedThumbnail.secure_url,
                    thumbnailId:updatedThumbnail.public_id
                }
                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
                res.status(200).json({
                    updatedVideo:updatedVideoDetail
                })
            }
            else
            {
                    const updatedData = {
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(",")
                }
                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
                res.status(200).json({
                    updatedVideo:updatedVideoDetail
                })
            }
        }
        else
        {
            res.status(500).json({
                error:"You have no permission"
            })
        }
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


router.delete('/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN)
        console.log(verifiedUser)
        const video = await Video.findById(req.params.videoId)
        if(video.user_id == verifiedUser._id)
            {
            await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'})
            await cloudinary.uploader.destroy(video.thumbnailId)
            const deleteResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                deletedResponse:deleteResponse
            })
        }
        else
        {
            res.status(500).json({
                error:"You have no permissions to delete this video"
            })
        }
       
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})
module.exports = router