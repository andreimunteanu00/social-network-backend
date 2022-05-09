import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/user";
import * as HttpStatus from 'http-status';

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

  static editUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const user: User = req.body;
    const userRepository = getRepository(User);

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

  static getImageById = async (req: Request, res: Response) => {
    console.log(req.body);
  }

};

export default UserController;
