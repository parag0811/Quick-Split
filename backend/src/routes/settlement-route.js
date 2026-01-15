import express from "express";
const router = express.Router();
import settlement_controller from "../controllers/settlement-controller.js";
import isAuth from "../middleware/is-auth.js";

router.post("/group/:groupId/settlement", isAuth, settlement_controller.getSettlement);

export default router;
