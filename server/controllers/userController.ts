import createHttpError from "http-errors";
import prisma from "../config/connection.js";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { User as PrismaUser } from "../generated/prisma/client.js";

export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication Required" });
        }

        const { id: userId } = req.user as PrismaUser;

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                provider: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!userData) {
            return next(createHttpError(404, "User not Found"));
        }

        res.status(200).json({
            success: true,
            message: "User Info Retrieved Successfully!",
            user: userData,
        });
    } catch (err) {
        return next(err);
    }
};

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const { id: userId } = req.user as PrismaUser;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return next(createHttpError(404, "User not Found"));
        }

        if (!user.password) {
            return next(
                createHttpError(
                    400,
                    "Account uses Github Login, No need to change Password",
                ),
            );
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            return next(createHttpError(401, "Invalid Password"));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            success: true,
            message: "Password Changed Successfully!",
        });
    } catch (err) {
        return next(err);
    }
};

export const patchUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { name, email } = req.body;

        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId },
                },
            });

            if (existingUser) {
                return next(createHttpError(409, "Email already in use"));
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                provider: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { confirm } = req.body; // look for a confirm in the body

        if (!confirm) {
            return res.status(400).json({
                success: false,
                message:
                    "Are You Sure? Please send 'confirm: true' to delete Your account permanently",
            });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });

        if (!deletedUser) {
            return next(createHttpError(404, "User not found"));
        }

        // clear cookies after successful deletion
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

        const { password, refreshToken, ...safeUser } = deletedUser;

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user: safeUser,
        });
    } catch (err) {
        return next(err);
    }
};
