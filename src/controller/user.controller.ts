import { Request, Response } from "express";
import {getManager, getRepository} from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/user";
import * as HttpStatus from 'http-status';
import {FileController} from "./file.controller";
import {Chat} from "../entity/chat";
import jwt_decode from "jwt-decode";
import {Post} from "../entity/post";
import {checkLikedPosts, getTimeCreated} from "../middleware/postUtils";

class UserController{

  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ["id", "username", "role"] //We dont want to send the passwords on response
    });

    //Send the users object
    res.status(201).send(users);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: number = Number(req.params.id);

    //Get the user from database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOne(id);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send("User not found");
    }
    res.send(user);
  };

  static getImageById = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;

    try {
      const user = await getRepository(User).findOneOrFail({ where: { id: userId } });
      if (user.profilePic) {
        const img = await Promise.resolve(FileController.getPhoto(`src/asset/user/${userId}.png`));
        res.status(HttpStatus.OK).send({img});
      } else {
        res.status(HttpStatus.OK).send();
      }
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }

  }

  static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { username, password, role } = req.body;
    let user = new User();
    user.username = username;
    user.password = password;
    user.role = role;

    //Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).send(errors);
      return;
    }

    //Hash the password, to securely store on DB
    user.hashPassword();

    //Try to save. If fails, the username is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(HttpStatus.CONFLICT).send("username already in use");
      return;
    }

    //If all ok, send 201 response
    res.status(HttpStatus.CREATED).send("User created");
  };

  static save = async (req: Request, res: Response) => {
    //Get the ID from the url
    const user: User = req.body;
    const userRepository = getRepository(User);
    const temp = user.profilePic;

    // Upload photo if exists
    if (!user.profilePic.includes("src")) {
      user.profilePic = `src/asset/user/${user.id}.png`;
      await Promise.resolve(FileController.uploadPhoto(temp, user.profilePic));
    }

    //Try to safe, if fails, that means username already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(HttpStatus.CONFLICT).send("username already in use");
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(HttpStatus.NO_CONTENT).send();
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send("User not found");
      return;
    }
    await userRepository.delete(id);

    //After all send a 204 (no content, but accepted) response
    res.status(HttpStatus.NO_CONTENT).send();
  };

  static getUserGroups = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;

    console.log(userId);

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["groups"] });

      res.status(HttpStatus.OK).send(user.groups);

    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e);
    }
  }

  static getUserPosts = async (req: Request, res: Response) => {
    let userId = res.locals.jwtPayload.userId;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["posts"] });

      res.status(HttpStatus.OK).send(user.posts);

    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static moderatorOfGroup = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;
    const groupId = req.params.groupId;

    try {
      let user = await getRepository(User).findOneOrFail({where: {id: userId} , relations: ["moderatedGroups"]})
      for (let g of user.moderatedGroups) {
        if (g.id === +groupId) {
          return res.status(HttpStatus.OK).send(true);
        }
      }
      res.status(HttpStatus.OK).send(false);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getChats = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;
    try {
      const user = await getRepository(User).findOneOrFail({ where: {id: userId}, relations: ["chats"]});
      res.status(HttpStatus.OK).send(user.chats);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getNewChats = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;
    try {
      const user = await getRepository(User).findOneOrFail({ where: {id: userId}, relations: ["chats"]});
      const users = await getRepository(User).find({ relations: ["chats"] });
      const chats = await getRepository(Chat).find({relations: ["users"]});
      let newUserToChat = [];
      for (let u of users) {
        let found = false;
        for (let c of u.chats) {
          for (let myc of user.chats) {
            if (c.id === myc.id) {
              found = true;
              break;
            }
          }
          if (!found) {
            break;
          }
        }
        if (!found) {
          newUserToChat.push(u);
        }
      }
      res.status(HttpStatus.OK).send(newUserToChat);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static createChat = async (req: Request, res: Response) => {
    const userWith = req.params.id;
    const encodedToken = <string>req.headers["authorization"]?.substring(7);
    const token: any = jwt_decode(encodedToken);
    const userId = token.userId;
    try {
      const userRepository = await getRepository(User);
      const userTo = await userRepository.findOneOrFail({where: {id: userWith}});
      const userFrom = await userRepository.findOneOrFail({where: {id: userId}});
      const chat = new Chat();
      await getRepository(Chat).save(chat);
      const entityManager = getManager();
      await entityManager.query(`
      INSERT INTO chat_user(chatId, userId)
      VALUES (?, ?), (?, ?)
      `, [chat.id, userFrom.id, chat.id, userTo.id]);
      res.status(HttpStatus.CREATED).send(chat.id);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getUserFeed = async (req: Request, res: Response) => {
    const userId = res.locals.jwtPayload.userId;
    let lastIndex;
    if (req.params.hasOwnProperty("lastIndex")) {
      lastIndex = req.params.lastIndex;
    } else {
      lastIndex = 0;
    }

    try {
      const postRepository = getRepository(Post);
      const userRepository = getRepository(User);

      const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ["groups"] });
      const userGroups = user.getGroupsIndexArray();

      const query = postRepository.createQueryBuilder("post")
          .where("post.groupId IN (:groups)", {groups: userGroups})
          .andWhere("post.id > :lastIndex", {lastIndex: lastIndex})
          .loadRelationCountAndMap("post.likeCount", "post.userLikes")
          .loadRelationIdAndMap("post.userLikesIds", "post.userLikes")
          .orderBy("post.id")
          .limit(10);

      const posts = await query.getMany();

      checkLikedPosts(user, posts);
      getTimeCreated(posts);

      res.status(HttpStatus.OK).send(posts);
    } catch (e) {
      console.log(e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }
}

export default UserController;
