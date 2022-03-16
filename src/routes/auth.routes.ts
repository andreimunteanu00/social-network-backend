import { Router } from "express";
import AuthController from "../controller/auth.controller";
import { checkJwt } from "../middleware/checkJwt";

const router = Router();
//Login route
router.post("/login", AuthController.login);

//Change my password
router.post("/change-password", [checkJwt], AuthController.changePassword);

//Register
router.post("/register", AuthController.register);

export default router;
