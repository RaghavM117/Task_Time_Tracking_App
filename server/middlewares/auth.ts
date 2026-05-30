import createHttpError from "http-errors";
import prisma from "../config/connection.js";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const secret_key = process.env.JWT_SECRET;

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return next(createHttpError(401, "Authentication Required"));
        }

        const decoded = jwt.verify(token, secret_key!) as jwt.JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return next(createHttpError(401, "User no Longer Exists"));
        }

        req.user = user;
        next();
    } catch (err) {
        return next(err);
    }
};

export default auth;
