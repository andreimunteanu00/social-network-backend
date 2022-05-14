import {Router} from "express";
import PostController from "../controller/post.controller";
import {checkRole} from "../middleware/checkRole";
import {checkJwt} from "../middleware/checkJwt";

const router = Router();

router.post('/:groupId', [checkJwt], PostController.createPost);

router.put('/:postId', [checkJwt], PostController.likePost);

export default router;