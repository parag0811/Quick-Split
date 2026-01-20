import express from "express";
const router = express.Router();
import { body } from "express-validator";
import auth_controller from "../controllers/auth-controller.js";
import expressValidation from "../middleware/validator.js";

const authValidate = [
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Email must be valid.")
    .bail()
    .trim()
    .normalizeEmail(),
  body("image").optional().isString().withMessage("Image must be a valid string."),
];

router.post(
  "/auth/google",
  authValidate,
  expressValidation,
  auth_controller.authUser,
);

router.post("/auth/logout", auth_controller.authLogout);

export default router;
