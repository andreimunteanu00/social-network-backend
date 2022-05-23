import {Request, Response} from "express";
import * as HttpStatus from 'http-status';
import {getRepository} from "typeorm";
import {User} from "../entity/user";
import {Story} from "../entity/story";
import {FileController} from "./file.controller";
import {getTimeCreated} from "../middleware/postUtils";

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

            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["groups", "groups.users"] });

            // Get a list of users in the same groups as our
            // main user, without duplicates
            let map: any = {};
            let userConnections = [];
            for (let group of user.groups) {
                for (let u of group.users) {
                    if (!map[u.id]) {
                        userConnections.push(u.id);
                        map[u.id] = true;
                    }
                }
            }

            // Get stories created by these users
            let query = storyRepository.createQueryBuilder("story")
                .where("story.userId IN (:userConnections)", { userConnections: userConnections })
                .leftJoinAndSelect("story.author", "author");

            const stories = await query.getMany();

            console.log(stories);

            getTimeCreated(stories);
            await FileController.getStoryProfilePhotos(stories);

            res.status(HttpStatus.OK).send(stories);
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static getStoryMedia = async (req: Request, res: Response) => {
        const storyId = req.params.storyId;

        try {
            const storyRepository = getRepository(Story);

            const story = await storyRepository.findOneOrFail({ where: { id: storyId } });
            const media = await Promise.resolve(FileController.getPhoto(story.filename));

            res.status(HttpStatus.OK).send({ media: media });
        } catch (e) {
            console.log(e);
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

export default StoryController;