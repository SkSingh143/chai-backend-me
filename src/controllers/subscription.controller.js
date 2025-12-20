import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { match } from "assert"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id

    const isSubsribed=await Subscription.find({
        channel:new mongoose.Types.ObjectId(channelId),
        subscriber:new mongoose.Types.ObjectId(userId)
    }).select("-createdAt -updatedAt") // in these when we provide multiple option its bydefault and channel and subscriber 
      
     console.log("is subscribed information",isSubsribed);

     if(isSubsribed.length == 0){
       await Subscription.create({
            channel:channelId,
            subscriber:userId
        })

        return res.status(200)
        .json(new ApiResponse(200,[1],"now user is subscribed to the channel "))
    }
    else
        {
      await Subscription.deleteOne({_id:new mongoose.Types.ObjectId((isSubsribed[0])._id)})
        return res.status(200)
        .json(new ApiResponse(200,[0],"now user is unsubscribed to the channel "))
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params //yaha pe ek aue chiz ho skata hai ki 
    //humlog req.user._id leke ye bhi return kare ki ye user subscribed hai ki nhi is channel pe  
    
    if(!channelId){
        throw new ApiError(403,"channel id is required")
    }

    const subscriber = await Subscription.aggregate([//subxscriber gets an array i confirmed 
        {
            $match:{
              channel: new mongoose.Types.ObjectId(channelId) 
            }
        },
        {
            $lookup:{
                from:'users',
                foreignField:'_id',
                localField:'subscriber',
                as:'subscriberInfo'
            }
        },
        {
            $unwind:'$subscriberInfo'
        },
        {
            $project:{
                _id:0,
                username:'$subscriberInfo.username',
                email:'$subscriberInfo.email',
                avatar:"$subscriberInfo.avatar",
                createdAt:"$subscriberInfo.createdAt"
            }
        }
    ])

    if(subscriber.length==0){
         return new ApiResponse(200,[],"this channel has not any subscriber")
    }
     
    return res
    .status(200)
    .json(new ApiResponse(200,[
        {subscriberNumber:subscriber.length},
        {subscriberDetails:subscriber}
    ],"subsscriber lsit sent succesfully "))
    

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(403,"subcriberId is required ")
    }

    const mySubscriptions =await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },{
           $lookup:{
                from:"users",
                foreignField:"_id",
                localField:'subscriber',
                as:"info"
            }
        },
        {
              $unwind:'$info'
        },{
            $project:{
                _id:0,
                username:'$info.username',
                email:'$info.email',
                avatar:"$info.avatar",
                createdAt:"$info.createdAt"
            }
        }
    ])


    if(mySubscriptions.length == 0){
        return res.status(200).json(new ApiResponse(200,{},"this channel has not subscribed to any channel yet"))
    }

    return res.
    status(200).json(new ApiResponse(200,{
            numberOfChannelsSubscribed:mySubscriptions.length,
            information:mySubscriptions
        },"data sent succesfully "))
}) 


    

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}