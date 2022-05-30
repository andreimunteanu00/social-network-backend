import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/user";
import config from "../config/config";
import * as HttpStatus from 'http-status';

class AuthController {

  static login = async (req: Request, res: Response) => {
    try {
      //Check if email and password are set
      let { email, password } = req.body;
      if (!(email && password)) {
        res.status(HttpStatus.UNAUTHORIZED).send();
      }

      //Get user from database
      const userRepository = getRepository(User);
      let user: User;
      try {
        user = await userRepository.findOneOrFail({ where: { email } });
      } catch (error) {
        res.status(HttpStatus.UNAUTHORIZED).send();
      }

      //Check if encrypted password match
      if (!user!.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(HttpStatus.UNAUTHORIZED).send();
        return;
      }

      //Sing JWT, valid for 7 days
      const token = jwt.sign(
        { userId: user!.id, username: user!.username, role: user!.role },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      //Send the jwt in the response
      res.send({ "token": token });
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  };

  static changePassword = async (req: Request, res: Response) => {
    try {
    //Get parameters from the body
    const { email, oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(HttpStatus.BAD_REQUEST).send();
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }

    //Check if old password matchs
    if (!user!.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    //Validate de model (password lenght)
    user!.password = newPassword;
    const errors = await validate(user!);
    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).send(errors);
      return;
    }
    //Hash the new password and save
    user!.hashPassword();
    await userRepository.save(user!);

    let response = {success: "Password changed successfully!"}
    res.status(HttpStatus.OK).send(response);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  };

  static register = async (req: Request, res: Response) => {
    let response = null;
    try {
      const userRepository = getRepository(User);
      let user: User = req.body;
      user.role = "user";
      user.imageString = "";
      user.firstName = "";
      user.lastName = "";
      user.birthDate = new Date();
      user.profilePic = "";
      user = await userRepository.create(user);
      user.hashPassword();
      await userRepository.save(user);
      response = {success: "User created!"}
      res.status(HttpStatus.CREATED).send(response);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

}

export default AuthController;
