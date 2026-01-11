import express from "express";
const router = express.Router();
import group_controller from "../controllers/group-controller.js";
import isAuth from "../middleware/is-auth.js";

router.post("/create-group", isAuth, group_controller.createGroup);

router.post("/groups/join-group", isAuth, group_controller.joinGroup);

router.get("/groups/my-groups", isAuth, group_controller.getGroups);

export default router;
