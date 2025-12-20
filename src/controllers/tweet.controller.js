import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {text} = req.body
     if(!text)
        {
            return res.status(403)
            .json(new ApiError(403,"some trxt is requires i want to post ",))
        }
    
    await Tweet.create({
        content:text,
        owner:req.user._id
    })
     
     
    res
    .status(200)//this status is the status that is real status of process 
    .json(new ApiResponse(200,[1],"tweet saved succesfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId=req.user._id;
    
    const tweets= await Tweet.find({
        owner:new mongoose.Types.ObjectId(userId)
    })

    if(!tweets){
        return res.status(200)
        .json(new ApiResponse(200,[],"this user have not tweeted anything yet"))
    }

    return res.status(200)
        .json(new ApiResponse(200,tweets,"users tweets have been sent succesfully "))



})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId }= req.params
    const {text} =req.body

    if(!tweetId){
        return res
        .status(403)
        .json(new ApiError(403,"tweet information is required to edit the tweet "))
    }

    const tweet=await Tweet.findById(tweetId).select("-owner -createdAt -updatedAt")

    if(!tweetId){
        return res
        .status(403)
        .json(new ApiError(403,"no such tweet present "))
    }

    tweet.content=text;
    tweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200,tweet,"tweet updated succesfully"))




})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params

    if(!tweetId){
        return res
        .status(403)
        .json(new ApiError(403,"tweet information is required to delete the tweet "))
    }

    await Tweet.findByIdAndDelete(new mongoose.Types.ObjectId(tweetId))

    return res
    .status(200)
    .json(new ApiResponse(200,[1],"tweet deleted succesfully "))


})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
