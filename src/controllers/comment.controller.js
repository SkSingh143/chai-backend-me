import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    
    if(!videoId){
        req.status(403)
        .json(new ApiError(403,"information about video is missing "))
    }

    const commentsOnVideo = await Comment.find({
        video:videoId,
        owner:req.user._id
    }).skip((page-1)*limit)
    .limit(limit).select("-createdAt -updatedAt -_id -__v")

    return res.
    status(200)
    .json(new ApiResponse(200,commentsOnVideo,"comment on this videos are fetched "))

})
const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {tweetId} = req.params
    const {page = 1, limit = 10} = Number(req.query)

    if(!tweetId){
        res.status(403)
        .json(new ApiError(403,"information about video is missing "))
    }

    const commentsOnTweet = await Comment.find({
        tweet:tweetId,
        owner:req.user._id
    }).skip((page-1)*limit)
    .limit(limit).select("-createdAt -updatedAt -_id")

    return res.
    status(200)
    .json(new ApiResponse(200,commentsOnTweet,"comment on this tweets are fetched "))

})

const addCommentOnTweet = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
   const comment = req.body
    const tweetId = req.params

    if(!comment){
        res.status(403)
        .json(new ApiError(403,"comment cannot be empty"))
    }
    if(!tweetId){
        res.status(403)
        .json(new ApiError(403,"information on video is missing "))
    }

    const createdComment = await Comment.create({
        content:comment,
        owner:req.user?._id,
        tweet: tweetId
    }).select("-createdAt -updatedAt -_id")

    return res
    .status(200)
    .json(new ApiResponse(200,createdComment,"your comment has been succesfully added"))
})
const addCommentOnVideo = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {comment} = req.body
    const {videoId }= req.params

    if(!comment){
        res.status(403)
        .json(new ApiError(403,"comment cannot be empty"))
    }
    if(!videoId){
        res.status(403)
        .json(new ApiError(403,"information on video is missing "))
    }

    const createdComment = await Comment.create({
        content:comment,
        owner:req.user?._id,
        video: videoId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,createdComment,"your comment has been succesfully added"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newComment} = req.body
    if(!commentId){
        return res.status(403)
        .json(new ApiError(403,"information is required about the tweet"))
    }
    if(!newComment){
        return res.status(403)
        .json(new ApiError(403,"comment cannot be empty"))
    }

    const oldComment= await Comment.findById(commentId).select("-createdAt -updatedAt")

    oldComment.content=newComment
    oldComment.save();

    

    return res
    .status(200)
    .json(new ApiResponse(200,oldComment,"your comment have been succesfully updated"))
    

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        return res.status(403)
        .json(new ApiError(403,"information is required about the tweet"))
    }
     await Comment.findByIdAndDelete(commentId)

     return res
    .status(200)
    .json(new ApiResponse(200,[1],"your comment have been succesfully deleted"))

})

export {
    getVideoComments,
    getTweetComments, 
    addCommentOnTweet,
    addCommentOnVideo, 
    updateComment,
     deleteComment
    }
