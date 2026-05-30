import { Router } from "express";
import {
    registerUser,
    loginUser,
    logout,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validation/authSchema.js";
import { sendAuthToken } from "../controllers/tokenController.js";
import { refreshAccessToken } from "../controllers/refreshController.js";
import passport from "passport";
import auth from "../middlewares/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser, sendAuthToken);

router.post("/login", validate(loginSchema), loginUser, sendAuthToken);

router.post("/logout", auth, logout);

// github auth trigger
router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] }),
);

//github Oauth callback
router.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "/login",
    }),
    sendAuthToken,
);

// refresh token
router.post("/refresh", refreshAccessToken);

export default router;
