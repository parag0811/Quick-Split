import express from "express";
const router = express.Router();
import settlement_controller from "../controllers/settlement-controller.js";
import isAuth from "../middleware/is-auth.js";

router.post(
  "/group/:groupId/settlement",
  isAuth,
  settlement_controller.getSettlement,
);

router.post(
  "/group/settlement/:settlementId/mark-paid",
  isAuth,
  settlement_controller.settlementPaid,
);

router.get(
  "/group/:groupId/settlements",
  isAuth,
  settlement_controller.getAllSettlement,
);

export default router;
