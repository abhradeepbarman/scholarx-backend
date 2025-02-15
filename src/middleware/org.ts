import { NextFunction, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { UserRole } from "../constants";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

export const org = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { id } = req.user;

        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
        });

        if (user?.role !== UserRole.ORGANIZATION) {
            next(CustomErrorHandler.unAuthorized("Unauthorized Access"));
        }

        next();
    }
);
