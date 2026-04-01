import express from "express";
const router = express.Router();
import settlement_controller from "../controllers/settlement-controller.js";
import isAuth from "../middleware/is-auth.js";
import isGroupMember from "../middleware/is-member";

router.post(
  "/group/:groupId/settlements",
  isAuth,
  isGroupMember,
  settlement_controller.createSettlement,
);

router.get(
  "/group/:groupId/settlements",
  isAuth,
  isGroupMember,
  settlement_controller.getAllSettlement,
);


export default router;
