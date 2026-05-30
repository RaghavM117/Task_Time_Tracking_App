import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/connection.js";
import { logger } from "./middlewares/logger.js";
import { notFound } from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoute.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import timeLogRoutes from "./routes/timeLogsRoute.js";
import passport from "./config/passport.js";
import prisma from "./config/connection.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(passport.initialize());

//logger
app.use(logger);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/time-log", timeLogRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});

// Ready check for DB
app.get("/api/ready", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ready", database: "connected" });
    } catch (error) {
        res.status(503).json({ status: "not ready", database: "disconnected" });
    }
});

// root route
app.get("/", (req, res) => {
    res.json({ message: "Task Tracking API is running", status: "ok" });
});

app.use(notFound);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is being listened on PORT: `, PORT);
});
