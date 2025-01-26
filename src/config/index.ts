import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: process.env.PORT || 8000,
    ORIGIN_FRONTEND: process.env.ORIGIN_FRONTEND || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
    SALT: process.env.SALT || 10,
    MAIL_HOST: process.env.MAIL_HOST || "",
    MAIL_USER: process.env.MAIL_USER || "",
    MAIL_PASS: process.env.MAIL_PASS || "",
    MAIL_FROM: process.env.MAIL_FROM || "",
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
};

export default config;
