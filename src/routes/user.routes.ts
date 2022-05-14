import { Router } from "express";
import UserController from "../controller/user.controller";
import { checkJwt } from "../middleware/checkJwt";
import { checkRole } from "../middleware/checkRole";
import {loggedUser} from "../middleware/loggedUser";
import GroupController from "../controller/group.controller";
import {User} from "../entity/user";

const router = Router();

//Get all users
router.get("/", [checkJwt, checkRole(["ADMIN"])], UserController.listAll);

// Get one user
router.get(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["user", "MODERATOR", "ADMIN"]), loggedUser],
    UserController.getOneById
);

router.get(
  "/image/:id([0-9]+)",
  [checkJwt, checkRole(["user", "MODERATOR", "ADMIN"]), loggedUser],
  UserController.getImageById
);

//Create a new user
router.post("/", [checkJwt, checkRole(["ADMIN"])], UserController.newUser);

//Edit one user
router.patch(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["user"])],
    UserController.save
);

//Delete one user
router.delete(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["ADMIN"])],
    UserController.deleteUser
);

/* Get a list of user groups */
router.get('/groups', [checkJwt], UserController.getUserGroups);

/* Get a list of user's post history */
router.get('/posts', [checkJwt], UserController.getUserPosts);

router.get('/:groupId/checkModerator', [checkJwt], UserController.moderatorOfGroup);

router.get('/feed', [checkJwt], UserController.getUserFeed);

export default router;
