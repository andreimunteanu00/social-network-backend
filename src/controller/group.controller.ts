import {getRepository} from "typeorm";
import {Request, Response} from "express";
import {Group} from "../entity/group";
import {validate} from "class-validator";
import * as HttpStatus from 'http-status';
import {User} from "../entity/user";
import {FileController} from "./file.controller";
import {Post} from "../entity/post";

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

            let group = await groupRepository.findOneOrFail({ where: { id: groupId }, relations: ["pendingUsers"] });
            let user = await userRepository.findOneOrFail({ where: { id: userId }});

            for (let u of group.pendingUsers) {
              if (user.id === u.id) {
                let response = {error: "Request already sent!"}
                res.status(HttpStatus.OK).send(response);
                return;
              }
            }

            group.pendingUsers.push(user);
            await groupRepository.save(group);
            let response = {success: "Request sent!"}
            res.status(HttpStatus.OK).send(response);

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
            for (let u of group.pendingUsers) {
              u.imageString = await Promise.resolve(FileController.getPhoto(`src/asset/user/${u.id}.png`));
            }
            res.status(HttpStatus.OK).send(group.pendingUsers);

        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            return;
        }
    }

    static approveUser = async (req: Request, res: Response) => {
        let groupId = req.params.groupId;
        let userId = req.body.userId;
        let rep = req.body.response;

        try {
            let groupRepository = getRepository(Group);
            let userRepository = getRepository(User);

            let group = await groupRepository.findOneOrFail({ where: { id: groupId }, relations: ["pendingUsers", "users"]});
            let user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["pendingGroups", "groups"]});

            group.pendingUsers = group.pendingUsers.filter(u => u.id !== user.id);
            user.pendingGroups = user.pendingGroups.filter(g => g.id !== group.id);
            let response
            if (rep) {
                group.users.push(user);
                user.groups.push(group);
                response = {success: "Approved!"}
            } else {
                response = {error: "Rejected!"}
            }
            await userRepository.save(user);
            await groupRepository.save(group);
            res.status(HttpStatus.OK).send(response);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

  static getGroup = async (req: Request, res: Response) => {
      const groupId = req.params.groupId;

      try {
        let groupRepository = getRepository(Group);
        let group = await groupRepository.findOneOrFail({ where: {id: groupId }});
        res.status(HttpStatus.OK).send(group);
      } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
  }

  static getGroupsUserNotIn = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
      const groupRepository = await getRepository(Group);
      const user = await getRepository(User).findOneOrFail({ where: { id: userId } });
      const groups = await groupRepository.find({relations: ["users"]});
      const groupsWithoutUser = [];
      for (let g of groups) {
        let inGroup = false;
        for (let u of g.users) {
          if (user.id === u.id) {
            inGroup = true;
          }
        }
        if (!inGroup) {
          groupsWithoutUser.push(g);
        }
      }
      for (let g of groupsWithoutUser) {
        try {
          g.imageString = await Promise.resolve(FileController.getPhoto(g.image));
        } catch (e) {
          console.log(e);
        }
      }
      res.status(HttpStatus.OK).send({body: groupsWithoutUser});
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getGroupsUserIn = async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
      const user = await getRepository(User).findOneOrFail({ where: { id }, relations: ["groups"] });
      for (let g of user.groups) {
        try {
          g.imageString = await Promise.resolve(FileController.getPhoto(g.image));
        } catch (e) {
          console.log(e);
        }
      }
      res.status(HttpStatus.OK).send(user.groups);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getPosts = async (req: Request, res: Response) => {
        let lastIndex;
        if (req.body.hasOwnProperty("lastIndex")) {
            lastIndex = req.body.lastIndex;
        } else {
            lastIndex = 0;
        }
        const groupId = req.params.groupId;

        try {
            let query = await getRepository(Post).createQueryBuilder("post")
                .where("post.groupId = :groupId", { groupId: groupId})
                .andWhere("post.id > :lastIndex", { lastIndex: lastIndex })
                .orderBy("post.id").limit(10);

            let posts = await query.getMany();

            res.status(HttpStatus.OK).send(posts);

        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
  }
}

export default GroupController;
