import express from "express";
const router = express.Router();
import { body } from "express-validator";
import expressValidation from "../middleware/validator.js";
import expense_controller from "../controllers/expense-controller.js";
import isAuth from "../middleware/is-auth.js";

const allowedCategories = ["food", "travel", "rent", "shopping", "other"];
const allowedSplitTypes = ["equal", "number", "percentage"];

const expenseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title must not be empty.")
    .bail()
    .isLength({ min: 5, max: 45 })
    .withMessage("Title must be between 5 and 45 characters."),

  body("totalAmount")
    .notEmpty()
    .withMessage("Total amount is required.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Total amount must be a positive number."),

  body("category")
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(", ")}`),

  body("splitType")
    .isIn(allowedSplitTypes)
    .withMessage(`Split type must be one of: ${allowedSplitTypes.join(", ")}`),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Notes must be under 60 characters."),

  body("participants")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Participants must be a non-empty array."),

  body("participants.*.userId")
    .optional()
    .isMongoId()
    .withMessage("Participant userId must be a valid ID."),

  body("participants.*.value")
    .optional()
    .isNumeric()
    .withMessage("Participant value must be a number."),
];

router.post(
  "/group/:groupId/expense/add",
  isAuth,
  expenseValidation,
  expressValidation,
  expense_controller.addExpense,
);

router.post("/group/:groupId/balance", isAuth, expense_controller.balance);

export default router;
