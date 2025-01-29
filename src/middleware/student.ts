import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { UserRole } from "../constants";
import CustomErrorHandler from "../utils/CustomErrorHandler";

export const student = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { role } = req.user;

        if (role !== UserRole.STUDENT) {
            next(CustomErrorHandler.unAuthorized("Unauthorized Access"));
        }

        next();
    }
);
