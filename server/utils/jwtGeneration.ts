import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

const accessToken = process.env.JWT_SECRET;
const refreshToken = process.env.REFRESH_JWT_SECRET;

export const signAccessToken = async (userId: string) => {
    if (!accessToken) {
        throw createHttpError(500, "Access Token Not Found");
    }
    return jwt.sign({ id: userId }, accessToken, { expiresIn: "30m" });
};

export const signRefreshToken = async (userId: string, version: number) => {
    if (!refreshToken) {
        throw createHttpError(500, "Refresh Token Not Found");
    }
    return jwt.sign({ id: userId, version }, refreshToken, { expiresIn: "7d" });
};
