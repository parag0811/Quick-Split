import express from "express";
const router = express.Router();
import isAuth from "../middleware/is-auth";
import isGroupMember from "../middleware/is-member";
import balanceController from "../controllers/balance-controller";

router.get(
  "/group/:groupId/balances",
  isAuth,
  isGroupMember,
  balanceController.getGroupBalances,
);

export default router