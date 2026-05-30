import { Request, Response, NextFunction } from "express";
import prisma from "../config/connection.js";
import { User as PrismaUser } from "../generated/prisma/client.js";
import createHttpError from "http-errors";

export const getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;

        const task = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                timeLogs: {
                    select: {
                        duration: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Task Retrieved Successfully!",
            task,
        });
    } catch (err) {
        return next(err);
    }
};

export const getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;

        // Ensuring id is an string, take first if array of strings
        const taskId = Array.isArray(id) ? id[0] : id;

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: userId,
            },
            include: { timeLogs: true },
        });

        if (!task) {
            return next(createHttpError(404, "Task not Found!"));
        }

        res.status(200).json({
            success: true,
            message: "Task Retrieved Successfully!",
            task,
        });
    } catch (err) {
        next(err);
    }
};

export const createTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { title, description } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId,
            },
        });

        res.status(200).json({
            success: true,
            message: "Task Created Successfully!",
            task,
        });
    } catch (err) {
        return next(err);
    }
};

export const updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;
        const { title, description } = req.body;

        const taskId = Array.isArray(id) ? id[0] : id;

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            return next(createHttpError(404, "Task not Found!"));
        }

        const updateTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
            },
        });

        res.status(200).json({
            success: true,
            message: "Task Updated Successfully!",
            task: updateTask,
        });
    } catch (err) {
        return next(err);
    }
};

export const updateTaskStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;
        const { status } = req.body;

        const taskId = Array.isArray(id) ? id[0] : id;

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            return next(createHttpError(404, "Task not Found!"));
        }

        const updateTaskStatus = await prisma.task.update({
            where: { id: taskId },
            data: { status },
        });

        res.status(200).json({
            success: true,
            message: "Task Status Updated Successfully!",
            task: updateTaskStatus,
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;

        const taskId = Array.isArray(id) ? id[0] : id;

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            return next(createHttpError(404, "Task not Found!"));
        }

        const deletedTask = await prisma.task.delete({
            where: { id: taskId },
        });

        res.status(200).json({
            success: true,
            message: "Task Deleted Successfully!",
            task: deletedTask,
        });
    } catch (err) {
        return next(err);
    }
};
