import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { match } from "assert";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const isSubsribed = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  }).select("-createdAt -updatedAt"); // in these when we provide multiple option its bydefault and channel and subscriber

  console.log("is subscribed information", isSubsribed);

  if (!isSubsribed) {
    await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: true },
          "now user is subscribed to the channel "
        )
      );
  } else {
    await Subscription.deleteOne({
      channel: channelId,
      subscriber: userId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: true },
          "now user is unsubscribed to the channel "
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params; //yaha pe ek aue chiz ho skata hai ki
  //humlog req.user._id leke ye bhi return kare ki ye user subscribed hai ki nhi is channel pe

  if (!channelId) {
    throw new ApiError(403, "channel id is required");
  }

  const subscriber = await Subscription.aggregate([
    //subxscriber gets an array i confirmed
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: "$subscriberInfo",
    },
    {
      $project: {
        _id: 0,
        username: "$subscriberInfo.username",
        email: "$subscriberInfo.email",
        avatar: "$subscriberInfo.avatar",
        createdAt: "$subscriberInfo.createdAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        [
          { subscriberNumber: subscriber.length },
          { subscriberDetails: subscriber },
        ],
        "subsscriber list sent succesfully "
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(403, "subcriberId is required ");
  }

  const mySubscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "channel",
        as: "channelInfo",
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $project: {
        _id: 0,
        username: "$channelInfo.username",
        email: "$channelInfo.email",
        avatar: "$channelInfo.avatar",
        createdAt: "$channelInfo.createdAt",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        numberOfChannelsSubscribed: mySubscriptions.length,
        information: mySubscriptions,
      },
      "data sent succesfully "
    )
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
