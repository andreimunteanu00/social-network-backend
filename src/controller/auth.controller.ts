import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/user";
import config from "../config/config";
import * as HttpStatus from 'http-status';

class AuthController {
    static login = async (req: Request, res: Response) => {
        //Check if username and password are set
        let { username, password } = req.body;
        if (!(username && password)) {
            res.status(HttpStatus.UNAUTHORIZED).send();
        }

        //Get user from database
        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({ where: { username } });
        } catch (error) {
            res.status(HttpStatus.UNAUTHORIZED).send();
        }

        //Check if encrypted password match
        if (!user!.checkIfUnencryptedPasswordIsValid(password)) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }

        //Sing JWT, valid for 1 hour
        const token = jwt.sign(
            { userId: user!.id, username: user!.username, role: user!.role },
            config.jwtSecret,
            { expiresIn: "7d" }
        );

        //Send the jwt in the response
        res.send({ "token": token });
    };

    static changePassword = async (req: Request, res: Response) => {
        //Get ID from JWT
        const id = res.locals.jwtPayload.userId;

        //Get parameters from the body
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }

        //Get user from the database
        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (id) {
            res.status(HttpStatus.UNAUTHORIZED).send();
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

        res.status(HttpStatus.NO_CONTENT).send();
    };

    static register = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const { username, password } = req.body;

        //Check if username exists
        if (await userRepository.find({username: username}) == undefined) {
            res.status(HttpStatus.CONFLICT).send("Username already exists!");
        } else {
            const user = await userRepository.create({
                username,
                password,
                role: "user"
            });
            user.hashPassword();
            await userRepository.save(user);
            res.status(HttpStatus.CREATED).send("User created!");
        }
    }

}
export default AuthController;
