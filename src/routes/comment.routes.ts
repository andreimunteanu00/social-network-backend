import {Router} from "express";
import {checkJwt} from "../middleware/checkJwt";
import CommentController from "../controller/comment.controller";

const router = Router();

router.post('/:postId', [checkJwt], CommentController.createComment)