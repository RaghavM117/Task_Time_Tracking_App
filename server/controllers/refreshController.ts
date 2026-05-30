import prisma from "../config/connection.js";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/jwtGeneration.js";
import { Request, Response, NextFunction } from "express";

export const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res
                .status(401)
                .json({ message: "No Refresh Token Provided" });
        }

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_JWT_SECRET!,
        ) as jwt.JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.refreshToken !== token) {
            // -@ts-ignore
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        const newAccessToken = await signAccessToken(user.id);
        const newRefreshToken = await signRefreshToken(user.id);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000,
            path: "/",
        });

        res.status(200).json({ success: true, message: "Token Refreshed" });
    } catch (err) {
        return next(err);
    }
};
