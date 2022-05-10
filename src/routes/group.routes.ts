import {Router} from "express";
import GroupController from "../controller/group.controller";
import {checkRole} from "../middleware/checkRole";
import {checkJwt} from "../middleware/checkJwt";

const router = Router();

/* Get a list of all the groups */
router.get('/', [checkJwt], GroupController.listAll);

/* Get a group */
router.get('/:groupId', [checkJwt], GroupController.getGroup)


router.get('/userNotIn/:userId', [checkJwt], GroupController.getGroupsUserNotIn)

/* Create group */
router.post('/', [checkJwt, checkRole(["ADMIN"])], GroupController.createGroup);

/* Request group join */
router.post('/:groupId/join', [checkJwt], GroupController.requestGroupJoin);

/* Request a list of all pending users */
router.get('/:groupId/pending', [checkJwt], GroupController.listPendingUsers);

/* */
router.post('/:groupId/approve', [checkJwt, checkRole(["MODERATOR", "ADMIN"])], GroupController.approveUser);

export default router;
