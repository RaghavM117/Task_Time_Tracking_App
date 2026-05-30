import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500)
        .optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100).optional(),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500)
        .optional(),
});

export const statusUpdateSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});
