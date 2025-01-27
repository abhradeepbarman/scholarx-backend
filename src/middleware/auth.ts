import { NextFunction, Request, Response } from "express";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import jwt from "jsonwebtoken";
import config from "../config";

export const auth = async (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next(CustomErrorHandler.unAuthorized());
    }

    const token = authHeader?.split(" ")[1];

    try {
        const user = jwt.verify(token!, config.JWT_SECRET);
        if (!user) {
            next(CustomErrorHandler.unAuthorized());
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        next(CustomErrorHandler.unAuthorized());
    }
};
