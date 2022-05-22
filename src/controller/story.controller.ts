import { Request, Response } from "express";
import * as HttpStatus from 'http-status';
import {getRepository} from "typeorm";
import {User} from "../entity/user";
import {Story} from "../entity/story";
import {FileController} from "./file.controller";

class StoryController {
    static postStory = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;
        const image = req.body.image;

        try {
            const userRepository = getRepository(User);
            const storyRepository = getRepository(Story);

            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["stories"] });

            let story = new Story();
            story.author = user;

            if (user.stories == null) {
                user.stories = [];
            }

            user.stories.push(story);

            story = await storyRepository.save(story);
            await userRepository.save(user);

            story.filename = `src/asset/story/s_${userId}_${story.id}.png`;
            await Promise.resolve(FileController.uploadPhoto(image, story.filename));

            await storyRepository.save(story);

            res.status(HttpStatus.CREATED).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static getStoryFeed = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;

        try {
            const userRepository = getRepository(User);
            const storyRepository = getRepository(Story);

            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["groups"] });

            console.log(user.groups);

            res.status(HttpStatus.OK).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
}

export default StoryController;