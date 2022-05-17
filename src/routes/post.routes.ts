import {Router} from "express";
import PostController from "../controller/post.controller";
import {checkRole} from "../middleware/checkRole";
import {checkJwt} from "../middleware/checkJwt";

const router = Router();

router.post('/:groupId', [checkJwt], PostController.createPost);

router.patch('/:postId', [checkJwt], PostController.likePost);

router.patch('/:postId/unlike', [checkJwt], PostController.unlikePost)

export default router;