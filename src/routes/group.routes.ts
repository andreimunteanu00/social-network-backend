import {Router} from "express";
import GroupController from "../controller/group.controller";
import {checkRole} from "../middleware/checkRole";
import {checkJwt} from "../middleware/checkJwt";

const router = Router();

/* Get a list of all the groups */
router.get('/', GroupController.listAll);

/* Create group */
router.post('/', [checkJwt, checkRole(["ADMIN"])], GroupController.createGroup);

/* Request group join */
router.post('/', [checkJwt], GroupController.requestGroupJoin);

export default router;