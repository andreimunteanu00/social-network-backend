import {Request, Response} from "express";
import * as HttpStatus from 'http-status';
import {getRepository} from "typeorm";
import {Message} from "../entity/message";
import {Group} from "../entity/group";
import {Chat} from "../entity/chat";
import {User} from "../entity/user";
import jwt_decode from "jwt-decode";

class ChatController {

  static save = async (req: Request, res: Response) => {
    const message = req.body;
    const encodedToken = <string>req.headers["authorization"]?.substring(7);
    const token: any = jwt_decode(encodedToken);
    const username = token.username;
    try {
      if (username === message.sender) {
        getRepository(Message).save(message);
      }
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getChat = async (req: Request, res: Response) => {
    const roomId = req.params.id;
    try {
      const chatRepository = getRepository(Chat);
      const chat = await chatRepository.findOneOrFail({ where: {id: roomId }});
      res.status(HttpStatus.OK).send(chat);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }
  static getMessagesForThisRoom = async (req: Request, res: Response) => {
    const roomId = req.params.id;
    try {
      const chat = await getRepository(Chat).findOneOrFail({where: {id: roomId}, relations: ["messages"]});
      res.status(HttpStatus.OK).send(chat.messages);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }
}

export default ChatController;
