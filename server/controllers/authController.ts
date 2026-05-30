import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { User as PrismaUser } from "../generated/prisma/client.js";
import prisma from "../config/connection.js";

import { Request, Response, NextFunction } from "express";

export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ name: username }, { email }],
            },
        });

        if (existingUser) {
            return next(createHttpError(409, "User already exists!"));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name: username,
                email,
                password: hashedPassword,
            },
        });
        req.user = user;
        req.authAction = "register";
        next();
    } catch (err) {
        next(err);
    }
};

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { identifiers, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ name: identifiers }, { email: identifiers }],
            },
        });

        if (!user) {
            return next(createHttpError(404, "User Not Found"));
        }

        if (!user.password) {
            return next(createHttpError(400, "Login with Github"));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createHttpError(401, "Invalid Credentials"));
        }

        req.user = user;
        req.authAction = "login";
        next();
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        // Clear refresh token in database
        if (req.user) {
            const user = req.user as PrismaUser;
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            });
        }

        // Clear cookies
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};
