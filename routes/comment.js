const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Comment = require('../models/Comment')
const { route } = require('./video')
const checkAuth = require('../middleware/checkAuth')
const Video = require('../models/Video')
const jwt = require('jsonwebtoken');
const User = require('../models/User')

require('dotenv').config()


//Post a comment API
router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN) 
        console.log(verifiedUser)
        const newComment = new Comment({
            _id:new mongoose.Types.ObjectId,
            videoId:req.params.videoId,
            userId:verifiedUser._id,
            commentText:req.body.commentText
        })
        const comment = await newComment.save()
        res.status(200).json({
            newComment:comment
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


//get all comments of a video API
router.get('/:videoId',async(req,res)=>{
    try
    {
        const comments = await Comment.find({videoId:req.params.videoId}).populate('userId','channelName logoUrl')

        res.status(200).json({
            commentList : comments
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


router.put('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN) 
        console.log(verifiedUser)
        const comment =  await Comment.findById(req.params.commentId)
        console.log(comment)
        if(comment.userId!=verifiedUser._id)
        {
            res.status(500).json({
                error:'You are not the author of this comment'
            })
        }
        comment.commentText = req.body.commentText
        const updatedComment = await comment.save();
        res.status(200).json({
            updateComment:updatedComment
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

//Delete a Comment
router.delete('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_TOKEN) 
        console.log(verifiedUser)
        const comment =  await Comment.findById(req.params.commentId)
        console.log(comment)
        if(comment.userId!=verifiedUser._id)
        {
            return res.status(500).json({
                error:'You are not the author of this comment'
            })
        }
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({
            deletedData:"success"
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