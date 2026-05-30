import { Router } from "express";
import auth from "../middlewares/auth.js";
import { dailySummary } from "../controllers/summaryController.js";

const router = Router();

router.get("/", auth, dailySummary);

export default router;
