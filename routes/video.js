const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video')
const User = require('../models/User')
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret:process.env.API_SECRET 
});

//Post Video API
router.post('/upload-video',checkAuth,async(req,res)=>{
    try{
        console.log("Hii nice to see you")
        const token = req.headers.authorization.split(" ")[1];
        const user =  await jwt.verify(token,process.env.JWT_TOKEN)
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

//Update Video API
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

//Delete Video API
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

//Like a Video API
router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN)
        const video =  await Video.findById(req.params.videoId)
        console.log(video)
        if(video.likedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:"Alreday Liked"
            })
        }
        if(video.dislikedBy.includes(verifiedUser._id))
        {
            video.dislikes -= 1;
            video.dislikedBy = video.dislikedBy.filter(userId=>userId.toString()!=verifiedUser._id)
        }
        video.likes += 1;
        video.likedBy.push(verifiedUser._id)
        await video.save();
        return res.status(200).json({
            msg:'Liked'
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

//DisLike a Video API
router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN)
        const video =  await Video.findById(req.params.videoId)
        console.log(video)
        if(video.dislikedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:"Alreday DisLiked"
            })
        }
        if(video.likedBy.includes(verifiedUser._id))
        {
            video.likes -= 1;
            video.likedBy = video.likedBy.filter(userId=>userId.toString()!=verifiedUser._id)
        }
        video.dislikes += 1;
        video.dislikedBy.push(verifiedUser._id)
        await video.save();
        return res.status(200).json({
            msg:'DisLiked'
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

//Subscribe a channel API
router.put('/subscribe/:userBId',checkAuth,async(req,res)=>{
    try{
    const userA = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN)
    console.log(userA)
    const userB = await User.findById(req.params.userBId)
    console.log(userB)
    if(userB.subscribedBy.includes(userA._id))
    {
        return res.status(500).json({
            error:"You have already subscribed"
        })
    }

    // console.log("Not Subscribed")
    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save()
    const userAFullInformation = await User.findById(userA._id)
    userAFullInformation.subscribedChannels.push(userB._id)
    await userAFullInformation.save()
    res.status(200).json({
        msg:'Subscribed'
    })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }

})

//Unsubscibe a channel API
router.put('/unsubscribe/:userBId',checkAuth,async(req,res)=>{
    try
    {
       const userA = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN) 
       const userB = await  User.findById(req.params.userBId)
       console.log(userA)
       console.log(userB)
       if(userB.subscribedBy.includes(userA._id))
       {
        userB.subscribers -= 1;
        userB.subscribedBy = userB.subscribedBy.filter(userId=>userId.toString()!=userA._id)
        await userB.save()
        const userAFullInformation = await User.findById(userA._id)
        userAFullInformation.subscribedChannels = userAFullInformation.subscribedChannels.filter(userId=>userId.toString()!=userB._id)
        await userAFullInformation.save()
        res.status(200).json({
            msg:"Unsubscribed"
        })
       }
       else
       {
        return res.status(500).json({
            error : "Not Subscibed"
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


//Views on Video API
router.put('/view/:videoId',async(req,res)=>{
    try{
   const video =  await Video.findById(req.params.videoId)
   console.log(video)
   video.views+=1;
   await video.save()
   res.status(200).json({
    msg:'OK'
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