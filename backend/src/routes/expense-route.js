import express from "express";
const router = express.Router();
import expense_controller from "../controllers/expense-controller.js";
import isAuth from "../middleware/is-auth.js";

router.post("/group/:groupId/expense/add", isAuth, expense_controller.addExpense);

router.post("/group/:groupId/balance", isAuth, expense_controller.balance)

export default router;
