import express from "express";
const router = express.Router();
import isAuth from "../middleware/is-auth.js";
import isGroupMember from "../middleware/is-member.js";
import balanceController from "../controllers/balance-controller.js";

router.get(
  "/group/:groupId/balances",
  isAuth,
  isGroupMember,
  balanceController.getGroupBalances,
);

export default router