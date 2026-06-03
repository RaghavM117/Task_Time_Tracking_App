import prisma from "../config/connection.js";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/jwtGeneration.js";
import { Request, Response, NextFunction } from "express";

interface RefreshTokenPayload {
    id: string;
    version: number;
}

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
        ) as RefreshTokenPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.refreshToken !== token) {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        // checking version matches
        if (decoded.version !== user.refreshTokenVersion) {
            // Token theft detected
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res
                .status(403)
                .json({ message: "Session Invalid. Please Login again" });
        }

        const newVersion = user.refreshTokenVersion + 1; // Increase version

        const newAccessToken = await signAccessToken(user.id);
        const newRefreshToken = await signRefreshToken(user.id, newVersion);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshTokenVersion: newVersion,
                refreshToken: newRefreshToken,
            },
        });

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
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");

        if (
            err instanceof jwt.TokenExpiredError ||
            err instanceof jwt.JsonWebTokenError
        ) {
            return res
                .status(401)
                .json({ message: "Refresh token expired or invalid" });
        }
        return next(err);
    }
};
