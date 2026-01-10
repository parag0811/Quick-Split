import express from "express";
const router = express.Router();
import auth_controller from "../controllers/auth-controller.js";
import isAuth  from "../middleware/is-auth.js";

router.post("/auth/google", auth_controller.authUser);

router.post("/auth/logout", auth_controller.authLogout)

export default router;