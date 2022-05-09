import { Router } from "express";
import UserController from "../controller/user.controller";
import { checkJwt } from "../middleware/checkJwt";
import { checkRole } from "../middleware/checkRole";
import {loggedUser} from "../middleware/loggedUser";

const router = Router();

//Get all users
router.get("/", [checkJwt, checkRole(["ADMIN"])], UserController.listAll);

// Get one user
router.get(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["user"]), loggedUser],
    UserController.getOneById
);

router.get(
  "/image/:id([0-9]+)",
  [checkJwt, checkRole(["user"]), loggedUser],
  UserController.getImageById
);

//Create a new user
router.post("/", [checkJwt, checkRole(["ADMIN"])], UserController.newUser);

//Edit one user
router.put(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["user"])],
    UserController.editUser
);

//Delete one user
router.delete(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["ADMIN"])],
    UserController.deleteUser
);

export default router;
