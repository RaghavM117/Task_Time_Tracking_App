import colors from "colors";
import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const methodLoggers: Record<string, string> = {
        GET: String("green"),
        PUT: String("blue"),
        POST: String("yellow"),
        DELETE: String("red"),
        PATCH: String("cyan"),
    };

    const color = methodLoggers[req.method] || String("white");

    const logMessage: String = `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log((colors as any)[color](logMessage));
    next();
};
