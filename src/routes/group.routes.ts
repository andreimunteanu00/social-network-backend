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

router.get('/userIn/:userId', [checkJwt], GroupController.getGroupsUserIn)

/* Create group */
router.post('/', [checkJwt, checkRole(["ADMIN"])], GroupController.createGroup);

/* Request group join */
router.post('/:groupId/join', [checkJwt], GroupController.requestGroupJoin);

/* Request a list of all pending users */
router.get('/:groupId/pending', [checkJwt, checkRole(["MODERATOR", "ADMIN"])], GroupController.listPendingUsers);

/* */
router.post('/:groupId/approve', [checkJwt, checkRole(["MODERATOR", "ADMIN"])], GroupController.approveUser);

/* Returns a list of 10 posts from corresponding group, based on requested index */
router.get('/:groupId/posts/:lastIndex', [checkJwt], GroupController.getPosts);

export default router;
