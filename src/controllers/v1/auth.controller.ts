import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { db } from "../../db";
import { users } from "../../db/schema";
import { sendEmail } from "../../service/mail";
import { welcomeEmail } from "../../template/welcomeEmail";
import asyncHandler from "../../utils/asyncHandler";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import ResponseHandler from "../../utils/ResponseHandler";
import { registerSchema } from "../../validators";

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
        const genSalt = await bcrypt.genSalt(Number(config.SALT))
        const hashedPassword = await bcrypt.hash(password, genSalt);

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
        await sendEmail(email, "Welcome to ScholarX", welcomeEmail());

        // send success response
        return res.send(ResponseHandler(201, "User registered successfully"));
    }
);

export { userRegister };

