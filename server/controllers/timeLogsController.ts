import { Request, Response, NextFunction } from "express";
import prisma from "../config/connection.js";
import { User as PrismaUser } from "../generated/prisma/client.js";
import createHttpError from "http-errors";

export const startTimer = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;

        const taskId = Array.isArray(id) ? id[0] : id;

        const task = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!task) {
            return next(createHttpError(404, "Task not found"));
        }

        // Check if there is already an active timer (no endTime)
        const activeLog = await prisma.timeLog.findFirst({
            where: {
                taskId: taskId,
                userId,
                endTime: null,
            },
        });

        if (activeLog) {
            return next(
                createHttpError(400, "Timer already started for this task!"),
            );
        }

        // Create new time log
        const timeLog = await prisma.timeLog.create({
            data: {
                taskId: taskId,
                userId,
                startTime: new Date(),
            },
        });

        res.status(201).json({
            success: true,
            message: "Timer started successfully",
            timeLog,
        });
    } catch (err) {
        return next(err);
    }
};

export const endTimer = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;

        const taskId = Array.isArray(id) ? id[0] : id;

        const activeLog = await prisma.timeLog.findFirst({
            where: { taskId: taskId, userId, endTime: null },
        });

        if (!activeLog) {
            return next(
                createHttpError(404, "No active timer found for this task"),
            );
        }

        const endTime = new Date();
        const duration = Math.floor(
            (endTime.getTime() - activeLog.startTime.getTime()) / 1000,
        );

        //updating the timeLog
        const updateLog = await prisma.timeLog.update({
            where: { id: activeLog.id },
            data: { endTime, duration },
        });

        res.status(200).json({
            success: true,
            message: "Timer stopped successfully",
            timeLog: updateLog,
        });
    } catch (err) {
        return next(err);
    }
};

export const getTaskLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;
        const { id } = req.params;

        const taskId = Array.isArray(id) ? id[0] : id;

        const task = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!task) {
            return next(createHttpError(404, "Task not found"));
        }

        const logs = await prisma.timeLog.findMany({
            where: { taskId: taskId, userId },
            orderBy: { startTime: "desc" },
        });

        res.status(200).json({
            success: true,
            message: "Task logs retrieved successfully",
            logs,
        });
    } catch (err) {
        return next(err);
    }
};
