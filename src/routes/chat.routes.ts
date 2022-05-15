import {Router} from "express";
import AuthController from "../controller/auth.controller";
import ChatController from "../controller/chat.controller";

const router = Router();

router.post("/", ChatController.save);

router.get("/:id", ChatController.getChat);

router.get("/messages/:id", ChatController.getMessagesForThisRoom);

export default router;
