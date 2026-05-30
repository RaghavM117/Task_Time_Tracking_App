import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
    (schema: z.ZodType, property: "body" | "query" | "params" = "body") =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.safeParse(req[property]);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: {
                        errors: result.error.issues.map((e) => e.message),
                    },
                });
            }

            if (property === "query") {
                for (const key in req.query) delete req.query[key];
                Object.assign(req.query, result.data);
            } else {
                req[property] = result.data;
            }
            next();
        } catch (err) {
            next(err);
        }
    };
