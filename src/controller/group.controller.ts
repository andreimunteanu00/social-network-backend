import {getRepository} from "typeorm";
import {Request, Response} from "express";
import {Group} from "../entity/group";
import {validate} from "class-validator";
import * as HttpStatus from 'http-status';
import {User} from "../entity/user";

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
        let userId = res.locals.jwtPayload.userId;
        let groupId = req.params.groupId;

        try {
            const groupRepository = getRepository(Group);
            const userRepository = getRepository(User);

            let group = await groupRepository.findOneOrFail({ where: { id: groupId } });
            let user = await userRepository.findOneOrFail({ where: { id: userId } });

            if (group.pendingUsers == null) {
                group.pendingUsers = [];
            }

            if (user.pendingGroups == null) {
                user.pendingGroups = [];
            }

            if (!group.pendingUsers.includes(user) && !user.pendingGroups.includes(group)) {
                group.pendingUsers.push(user);
                group = await groupRepository.save(group);
            } else {
                res.status(HttpStatus.CONFLICT).send();
                return;
            }

            res.status(HttpStatus.OK).send();

        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            return;
        }
    }

    static listPendingUsers = async (req: Request, res: Response) => {
        let groupId = req.params.groupId;

        try {
            let groupRepository = getRepository(Group);
            let group = await groupRepository.findOneOrFail({ where: { id: groupId }, relations: ["pendingUsers"]});

            res.status(HttpStatus.OK).send(group.pendingUsers);

        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            return;
        }
    }

    static approveUser = async (req: Request, res: Response) => {
        let groupId = req.params.groupId;
        let userId = req.body.userId;

        try {
            let groupRepository = getRepository(Group);
            let userRepository = getRepository(User);

            let group = await groupRepository.findOneOrFail({ where: { id: groupId }, relations: ["pendingUsers", "users"]});
            let user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["pendingGroups", "groups"]});

            group.pendingUsers.filter(u => u.id !== user.id);
            console.log(group.pendingUsers);
            group.users.push(user);

            group = await groupRepository.save(group);

            res.status(HttpStatus.OK).send(group.users);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
}

export default GroupController;