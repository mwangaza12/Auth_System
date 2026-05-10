import { Router } from "express";
import { loginController, registerController } from "./auth.controller.js";

const authRouter: Router = Router();

authRouter.post("/login", loginController);
authRouter.post("/register", registerController);

export default authRouter;