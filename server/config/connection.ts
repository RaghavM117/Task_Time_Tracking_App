import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ PostgreSQL connected via Prisma");
    } catch (err) {
        console.error("❌ Unable to connect to the database:", err);
        process.exit(1);
    }
};

export default prisma;
