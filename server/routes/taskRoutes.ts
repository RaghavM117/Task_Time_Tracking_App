import { Router } from "express";
import auth from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
} from "../controllers/taskController.js";
import {
    createTaskSchema,
    updateTaskSchema,
    statusUpdateSchema,
} from "../validation/taskSchema.js";

const router = Router();

router.use(auth);

router.route("/").get(getTasks).post(validate(createTaskSchema), createTask);

router
    .route("/:id")
    .get(getTaskById)
    .put(validate(updateTaskSchema), updateTask)
    .delete(deleteTask);

router.patch("/:id/status", validate(statusUpdateSchema), updateTaskStatus);

export default router;
