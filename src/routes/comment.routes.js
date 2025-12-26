import { Router } from 'express';
import {
    addCommentOnTweet,
    addCommentOnVideo,
    deleteComment,
    getVideoComments,
    getTweetComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/video/:videoId").get(getVideoComments).post(addCommentOnVideo);
router.route("/tweet/:tweetId").get(getTweetComments).post(addCommentOnTweet);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router