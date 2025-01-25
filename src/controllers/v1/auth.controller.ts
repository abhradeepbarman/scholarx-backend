import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../../db";
import { users } from "../../db/schema";
import asyncHandler from "../../utils/asyncHandler";
import { registerSchema } from "../../validators";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import bcrypt from "bcryptjs";
import config from "../../config";
import ResponseHandler from "../../utils/ResponseHandler";

const userRegister = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, role } = registerSchema.parse(req.body);

        // check if user already exists with this email
        const isExist = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (isExist) {
            next(CustomErrorHandler.alreadyExist("User already exists"));
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, config.SALT);

        // create user
        const newUser = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                role,
            })
            .returning({
                id: users.id,
            });

        // send success email
        // send success response
        return res.send(ResponseHandler(201, "User registered successfully"));
    }
);

export { userRegister };
