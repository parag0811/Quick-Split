import express from "express";
const router = express.Router();
import { body } from "express-validator";
import expressValidation from "../middleware/validator.js";
import group_controller from "../controllers/group-controller.js";
import isAuth from "../middleware/is-auth.js";

const groupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name must not be empty.")
    .bail()
    .isLength({ min: 5, max: 30 })
    .withMessage("Name must be between 5 to 30 characters.")
    .bail(),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Description must be under 60 characters."),
  body("isPrivate")
    .optional()
    .isBoolean({ loose: "true" })
    .withMessage("Privacy must be Boolean."),
];

router.post(
  "/create-group",
  isAuth,
  groupValidation,
  expressValidation,
  group_controller.createGroup,
);

router.post("/groups/join-group", isAuth, group_controller.joinGroup);

router.get("/groups/my-groups", isAuth, group_controller.getGroups);

router.get(
  "/groups/:groupId/summary",
  isAuth,
  group_controller.getGroupSummary,
);

router.delete("/groups/:groupId/delete", isAuth, group_controller.deleteGroup);

export default router;
