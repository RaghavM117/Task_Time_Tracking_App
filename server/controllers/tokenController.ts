import { signAccessToken, signRefreshToken } from "../utils/jwtGeneration.js";
import prisma from "../config/connection.js";
import { Request, Response, NextFunction } from "express";
import { User as PrismaUser } from "../generated/prisma/client.js";

export const sendAuthToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = req.user as PrismaUser;

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        // store refreshToken in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000,
            path: "/",
        });

        if (user.provider === "github") {
            return res.redirect("http://localhost:5173/auth-success");
        }

        const message =
            req.authAction === "register"
                ? `${user.name} Registered successfully`
                : req.authAction === "login"
                  ? `${user.name} logged in successfully`
                  : `${user.name} logged out successfully`;

        res.status(200).json({
            success: true,
            message,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        return next(err);
    }
};
