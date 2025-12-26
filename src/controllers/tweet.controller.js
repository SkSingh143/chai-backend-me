import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, "some trxt is requires i want to post ");
  }

  const tweet = await Tweet.create({
    content: text,
    owner: req.user._id,
  });

  res
    .status(200) //this status is the status that is real status of process
    .json(new ApiResponse(200, tweet, "tweet saved succesfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user._id;

  const tweets = await Tweet.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, tweets, "users tweets have been sent succesfully ")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { text } = req.body;

  if (!tweetId) {
    throw new ApiError(403, "tweet information is required to edit the tweet ");
  }

  const tweet = await Tweet.findOne({
    _id: tweetId,
    owner: req.user._id,
  }).select("-owner -createdAt -updatedAt __v");

  if (!tweet) {
    throw new ApiError(404, "no such tweet present ");
  }

  tweet.content = text;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated succesfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(
      403,
      "tweet information is required to delete the tweet "
    );
  }

  const operation = await Tweet.findOneAndDelete({
    owner: req.user._id,
    _id: tweetId,
  });

  if (!operation) {
    throw new ApiError(404, "Tweet not found or unauthorized");
  }

  console.log(operation); //returns that particular thing that is getting deleted

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deleted: true }, "tweet deleted succesfully ")
    );
});
//ek check lag sakta hai ki koi apna hi channel subscribe toh nhi kar rha ais akuch kuch kuch aur bhi check
//ho sakta hai sochan padega
export { createTweet, getUserTweets, updateTweet, deleteTweet };
