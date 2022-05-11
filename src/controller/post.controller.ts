import {Request, Response} from "express";
import * as HttpStatus from "http-status";
import {getRepository} from "typeorm";
import {Post} from "../entity/post";
import {User} from "../entity/user";
import {Group} from "../entity/group";

class PostController {
    static createPost = async (req: Request, res: Response) => {
        let {title, body} = req.body;
        let userId = res.locals.jwtPayload.userId;
        let groupId = req.params.groupId;

        try {
            let postRepository = getRepository(Post);
            let userRepository = getRepository(User);
            let groupRepository = getRepository(Group);

            let author = await userRepository.findOneOrFail({ where: { id: userId } });
            let group = await groupRepository.findOneOrFail({ where: { id: groupId } });

            let post = new Post();
            post.title = title;
            post.bodyText = body;
            post.author = author;
            post.group = group;

            await postRepository.save(post);

            res.status(HttpStatus.CREATED).send();

        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

}

export default PostController;