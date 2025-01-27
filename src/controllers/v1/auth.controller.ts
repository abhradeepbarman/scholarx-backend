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
import loginSchema from "../../validators/v1/auth/login.validator";
import jwt from "jsonwebtoken";

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
        const genSalt = await bcrypt.genSalt(Number(config.SALT));
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

const userLogin = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = loginSchema.parse(req.body);

        // check if user exists
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return next(CustomErrorHandler.notFound("User not found"));
        }

        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user?.password!
        );

        if (!isPasswordCorrect) {
            next(CustomErrorHandler.unAuthorized("Invalid credentials"));
        }

        // generate access, refresh token
        const accessToken = jwt.sign({ id: user?.id }, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refreshToken = jwt.sign({ id: user?.id }, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        await db
            .update(users)
            .set({
                refresh_token: refreshToken,
            })
            .where(eq(users.id, user?.id!));

        return res
            .cookie("refresh_token", refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 60 * 60 * 1000,
            })
            .send(
                ResponseHandler(200, "Login successful", {
                    id: user?.id,
                    email: user?.email,
                    accessToken,
                })
            );
    }
);

const userLogout = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { id } = req.user;
        await db
            .update(users)
            .set({
                refresh_token: null,
            })
            .where(eq(users.id, req.user?.id!));

        return res
            .clearCookie("refresh_token", {
                httpOnly: true,
            })
            .clearCookie("access_token", { httpOnly: true })
            .send(ResponseHandler(200, "Logout successful"));
    }
);

export { userRegister, userLogin, userLogout };
