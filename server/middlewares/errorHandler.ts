import { Prisma } from "../generated/prisma/client.js";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // handling duplicate value
    if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
    ) {
        (err as any).status = 409;
        err.message = "Duplicate Field Value";
    }

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || "Internal Server Error",
            statusCode,
        },
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorHandler;
