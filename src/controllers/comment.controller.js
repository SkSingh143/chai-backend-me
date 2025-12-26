import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!videoId) {
    throw new ApiError(403, "information about video is missing ");
  }

  const commentsOnVideo = await Comment.find({
    video: videoId,
    // owner:req.user._id    //otheerwise user will see only those comments which he did on that video
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-createdAt -updatedAt  -__v");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        commentsOnVideo,
        "comment on this videos are fetched "
      )
    );
});
const getTweetComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { tweetId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!tweetId) {
    throw new ApiError(403, "information about video is missing ");
  }

  const commentsOnTweet = await Comment.find({
    tweet: tweetId,
    // owner:req.user._id  //otherwise he will se only his comment
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-createdAt -updatedAt ");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        commentsOnTweet,
        "comment on this tweets are fetched "
      )
    );
});

const addCommentOnTweet = asyncHandler(async (req, res) => {
  // TODO: add a comment to a tweet
  const { comment } = req.body;
  const { tweetId } = req.params;

  console.log(req.params);

  if (!comment) {
    throw new ApiError(404, "comment cannot be empty");
  }
  if (!tweetId) {
    throw new ApiError(403, "information on video is missing ");
  }

  const createdComment = await Comment.create({
    content: comment,
    owner: req.user._id,
    tweet: tweetId,
    video: null,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdComment,
        "your comment on this tweet  has been succesfully added"
      )
    );
});

const addCommentOnVideo = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { comment } = req.body;
  const { videoId } = req.params;

  if (!comment) {
    throw new ApiError(404, "comment cannot be empty");
  }
  if (!videoId) {
    throw new ApiError(403, "information on video is missing ");
  }

  const createdComment = await Comment.create({
    content: comment,
    owner: req.user._id,
    video: videoId,
    tweet: null,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdComment,
        "your comment has been succesfully added on this video"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { newComment } = req.body;
  if (!commentId) {
    throw new ApiError(403, "information is required about the tweet");
  }
  if (!newComment) {
    throw new ApiError(404, "comment cannot be empty");
  }

  // const oldComment= await Comment.findById(commentId).select("-createdAt -updatedAt") this is authenticated but not authorized
  const oldComment = await Comment.findOne({
    owner: req.user._id,
    _id: commentId,
  }).select("-createdAt -updatedAt");

  if (!oldComment) {
    throw new ApiError(400, "no  such comment ");
  }

  oldComment.content = newComment;
  await oldComment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        oldComment,
        "your comment have been succesfully updated"
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(403, "information is required about the tweet");
  }
  const opertation = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  }); //this is the good code which checks authorization
  if (!opertation) {
    throw new ApiError(404, "no such comment ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deleted: true },
        "your comment have been succesfully deleted"
      )
    );
});
//ek check lag sakta hai ki koi apna hi channel subscribe toh nhi kar rha ais akuch kuch kuch aur bhi check
//ho sakta hai sochan padega
export {
  getVideoComments,
  getTweetComments,
  addCommentOnTweet,
  addCommentOnVideo,
  updateComment,
  deleteComment,
};
