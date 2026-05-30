import { z } from "zod";

export const patchUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(50)
            .regex(/^[a-zA-Z0-9]+$/, {
                message: "Username can only contain letters and numbers",
            })
            .optional(),
        email: z
            .string()
            .toLowerCase()
            .trim()
            .pipe(z.email({ message: "Invalid Email Address" }))
            .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });
