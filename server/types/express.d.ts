import { User as PrismaUser } from "../generated/prisma/client.js";

declare global {
    namespace Express {
        interface Request {
            user?: PrismaUser;
            authAction?: string;
        }
    }
}
