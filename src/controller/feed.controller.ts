import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/user";
import config from "../config/config";
import {Feed} from "../entity/feed";

class FeedController {
    static listAll = async (req: Request, res: Response) => {
        const feedRepository = getRepository(Feed);
        const users = await feedRepository.find({
            select: ["id", "name"]
        });
        res.send(users);
    };
}
export default FeedController;
