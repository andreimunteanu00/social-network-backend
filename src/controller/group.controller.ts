import {getRepository} from "typeorm";
import {Request, Response} from "express";
import {Group} from "../entity/group";
import {validate} from "class-validator";
import * as HttpStatus from 'http-status';

class GroupController {
    static listAll = async (req: Request, res: Response) => {
        const groupRepository = getRepository(Group);
        const groups = await groupRepository.find({
           select: ["id", "name", "description"]
        });

        return res.send(groups);
    }

    static createGroup = async (req: Request, res: Response) => {
        let {name, description} = req.body;
        let group = new Group();
        group.name = name;
        group.description = description;

        const errors = await validate(group);
        if (errors.length > 0) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errors);
            return;
        }

        const groupRepository = getRepository(Group);
        try {
            await groupRepository.save(group);
        } catch (e) {
            res.status(HttpStatus.CONFLICT).send("Failed to create group");
            return;
        }

        res.status(HttpStatus.CREATED).send(group);
    }

    static requestGroupJoin = async (req: Request, res: Response) => {

    }
}

export default GroupController;