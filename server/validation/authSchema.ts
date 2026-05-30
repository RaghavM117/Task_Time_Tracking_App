import { z } from "zod";

export const registerSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(2)
            .max(50)
            .regex(/^[a-zA-Z0-9]+$/, {
                message: "Username can only contain letters and numbers",
            }),
        email: z
            .string()
            .toLowerCase()
            .trim()
            .pipe(z.email({ message: "Invalid Email Address" })),
        password: z.string().trim().optional(),
        provider: z.enum(["github", "local"]).default("local").optional(),
        providerId: z.string().optional(),
    })
    .strict()
    .refine(
        (data) => {
            if (data.provider === "local") {
                const passwordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
                return (
                    data.password &&
                    data.password.length >= 8 &&
                    passwordRegex.test(data.password)
                );
            }
            return true; // GitHub users pass through without a password
        },
        {
            message:
                "Password is required and must be strong for local registration",
            path: ["password"],
        },
    );

export const loginSchema = z
    .object({
        identifiers: z.string().trim().min(1).max(100),
        password: z.string().trim().min(8),
    })
    .strict();

export const passwordSchema = z
    .object({
        currentPassword: z
            .string()
            .trim()
            .min(8, "Current Password is Required!"),
        newPassword: z
            .string()
            .trim()
            .min(8, "New Password is Required!")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                {
                    message:
                        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                },
            ),
    })
    .strict();
