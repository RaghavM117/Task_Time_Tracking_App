import { Router } from "express";
import auth from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { passwordSchema } from "../validation/authSchema.js";
import {
    patchUser,
    getProfile,
    deleteUser,
    changePassword,
} from "../controllers/userController.js";
import { patchUserSchema } from "../validation/userSchema.js";

const router = Router();

//change password
router.patch("/changePassword", auth, validate(passwordSchema), changePassword);

//user Profile

router
    .route("/profile")
    .all(auth)
    .get(getProfile)
    .patch(validate(patchUserSchema), patchUser)
    .delete(deleteUser);

export default router;
