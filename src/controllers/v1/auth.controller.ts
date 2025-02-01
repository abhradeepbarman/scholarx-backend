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
import { loginSchema, registerSchema } from "../../validators";
import jwt, { JwtPayload } from "jsonwebtoken";

const userRegister = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, role } = registerSchema.parse(req.body);

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
                name,
                email,
                password: hashedPassword,
                role,
            })
            .returning();

        // send success email
        await sendEmail(email, "Welcome to ScholarX", welcomeEmail());

        const payload: JwtPayload = { id: newUser[0].id };

        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refreshToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        await db
            .update(users)
            .set({
                refresh_token: refreshToken,
            })
            .where(eq(users.id, newUser[0].id));

        // send success response
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
                ResponseHandler(201, "User registered successfully", {
                    id: newUser[0].id,
                    role: newUser[0].role,
                    access_token: accessToken,
                })
            );
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
        const payload: JwtPayload = { id: user.id };

        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refreshToken = jwt.sign(payload, config.JWT_SECRET, {
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
                    role: user?.role,
                    access_token: accessToken,
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
            .where(eq(users.id, id));

        return res
            .clearCookie("refresh_token", {
                httpOnly: true,
            })
            .clearCookie("access_token", { httpOnly: true })
            .send(ResponseHandler(200, "Logout successful"));
    }
);

const refreshAccessToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { refresh_token } = req.cookies || req.body;

        if (!refresh_token) {
            next(CustomErrorHandler.unAuthorized("Unauthorized Access"));
        }

        const decoded: any = jwt.verify(refresh_token!, config.JWT_SECRET);

        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.id),
        });

        if (!user) {
            next(CustomErrorHandler.notFound("User not found"));
        }

        if (user?.refresh_token !== refresh_token) {
            next(
                CustomErrorHandler.notAllowed(
                    "Refresh token is expired or used"
                )
            );
        }

        // generate access, refresh token
        const payload: JwtPayload = { id: user?.id };

        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refreshToken = jwt.sign(payload, config.JWT_SECRET, {
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
                ResponseHandler(200, "Access token refresh successful", {
                    id: user?.id,
                    access_token: accessToken,
                })
            );
    }
);

export { userRegister, userLogin, userLogout, refreshAccessToken };
