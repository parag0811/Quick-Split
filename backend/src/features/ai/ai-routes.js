import express from "express";
import { suggestSplit } from "./ai-controller.js";
import { validateSplitSuggestion } from "../validators/ai-validator.js";

const router = express.Router();

router.post("/suggest-split", validateSplitSuggestion, suggestSplit);

export default router;
