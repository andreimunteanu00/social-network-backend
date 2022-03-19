import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import FeedController from "../controller/feed.controller";
import {checkRole} from "../middleware/checkRole";

const router = Router();

router.get("/", [checkJwt, checkRole], FeedController.listAll);

export default router;
