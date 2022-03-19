import {Router} from "express";
import auth from "./auth.routes";
import user from "./user.routes";
import feed from "./feed.router";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/feed", feed)

export default routes;
