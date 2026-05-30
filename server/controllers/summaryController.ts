import { Request, Response, NextFunction } from "express";
import prisma from "../config/connection.js";
import { User as PrismaUser } from "../generated/prisma/client.js";

export const dailySummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.user as PrismaUser;

        // Get todays date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // get all task for user with today's timelogs
        const tasks = await prisma.task.findMany({
            where: { userId },
            include: {
                timeLogs: {
                    where: {
                        startTime: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                },
            },
        });

        // calculate dailySummary
        let totalTime = 0;
        let completedTasks = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;

        const taskSummaries = tasks.map((task) => {
            const taskTime = task.timeLogs.reduce(
                (sum, log) => sum + (log.duration || 0),
                0,
            );
            totalTime += taskTime;

            if (task.status === "COMPLETED") {
                completedTasks++;
            } else if (task.status === "PENDING") {
                pendingTasks++;
            } else if (task.status === "IN_PROGRESS") {
                inProgressTasks++;
            }

            return {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                timeStamp: taskTime,
                sessions: task.timeLogs.length,
            };
        });

        return res.status(200).json({
            success: true,
            message: "Daily Summary Retrieved Successfully!",
            summary: {
                date: today.toISOString().split("T")[0],
                totalTime, // in seconds
                totalTimeFormatted: `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                tasks: taskSummaries.filter(
                    (t) => t.timeStamp > 0 || t.status !== "PENDING",
                ),
            },
        });
    } catch (err) {
        return next(err);
    }
};
