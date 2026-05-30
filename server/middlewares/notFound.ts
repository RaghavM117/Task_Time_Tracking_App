import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    return next(createHttpError(404, `Route ${req.originalUrl} not found`));
};
