import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
    startTimer,
    endTimer,
    getTaskLogs,
} from "../controllers/timeLogsController.js";

const router = Router();

router.use(auth);

router.post("/tasks/:id/start", startTimer);
router.post("/tasks/:id/end", endTimer);
router.get("/tasks/:id/logs", getTaskLogs);

export default router;
