import {Request, Response} from "express";
import {getRepository} from "typeorm";
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
