import {Request, Response} from "express";
import * as HttpStatus from "http-status";
import {getRepository} from "typeorm";
import {User} from "../entity/user";
import {Post} from "../entity/post";
import {Comment} from "../entity/comment"

class CommentController {
    static createComment = async (req: Request, res: Response) => {
        let text = req.body.text;
        let postId = req.params.postId;
        let userId = res.locals.jwtPayload.userId;

        try {
            const userRepository = getRepository(User);
            const postRepository = getRepository(Post);
            const commentRepository = getRepository(Comment);

            const user = await userRepository.findOneOrFail({ where: { id: userId } });
            const post = await postRepository.findOneOrFail({ where: { id: postId } });

            let comment = new Comment();
            comment.post = post;
            comment.author = user;
            comment.text = text;

            if (user.comments == null) {
                user.comments = [];
            }

            user.comments.push(comment);

            if (post.comments == null) {
                post.comments = [];
            }

            post.comments.push(comment);

            await userRepository.save(user);
            await postRepository.save(post);
            await commentRepository.save(comment);

            res.status(HttpStatus.CREATED).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
}

export default CommentController;