import {Request, Response} from "express";
import * as HttpStatus from "http-status";
import {getRepository} from "typeorm";
import {Post} from "../entity/post";
import {User} from "../entity/user";
import {Group} from "../entity/group";
import {FileController} from "./file.controller";
import {PostFile} from "../entity/postFile";

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

            if (req.body.hasOwnProperty("files")) {
                if (req.body.files.size > 4) {
                    res.status(HttpStatus.CONFLICT).send("Too many files!");
                }

                /* Required because we need the post's id to name the files.
                 * Id is generated when entity is saved.               
                 */
                post = await postRepository.save(post);

                const postFileRepository = getRepository(PostFile);
                let fileIndex = 0;
                for (let file of req.body.files) {
                    let postFile = new PostFile();
                    postFile.fileName = `src/asset/post/p_${post.id}_${fileIndex}.png`;

                    if (post.postFiles == null) {
                        post.postFiles = [];
                    }

                    post.postFiles.push(postFile);
                    await postFileRepository.save(postFile);

                    await Promise.resolve(FileController.uploadPhoto(file, postFile.fileName));
                    fileIndex++;
                }
            }

            await postRepository.save(post);

            res.status(HttpStatus.CREATED).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static likePost = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;
        const postId = req.params.postId;

        try {
            const userRepository = getRepository(User);
            const postRepository = getRepository(Post);

            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["likedPosts"] });
            const post = await postRepository.findOneOrFail({ where: { id: postId }, relations: ["userLikes"] });

            if (user.likedPosts == null) {
                user.likedPosts = [];
            }

            if (post.userLikes == null) {
                post.userLikes = [];
            }

            if (user.likedPosts.includes(post) || post.userLikes.includes(user)) {
                res.status(HttpStatus.CONFLICT).send();
                return;
            }

            user.likedPosts.push(post);
            post.userLikes.push(user);

            await userRepository.save(user);
            await postRepository.save(post);

            res.status(HttpStatus.OK).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static unlikePost = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;
        const postId = req.params.postId;

        try {
            const userRepository = getRepository(User);
            const postRepository = getRepository(Post);

            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["likedPosts"] });
            const post = await postRepository.findOneOrFail({ where: { id: postId }, relations: ["userLikes"] });

            user.likedPosts = user.likedPosts.filter(p => p.id != post.id);
            post.userLikes = post.userLikes.filter(u => u.id != user.id);

            await userRepository.save(user);
            await postRepository.save(post);

            res.status(HttpStatus.OK).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
}

export default PostController;
