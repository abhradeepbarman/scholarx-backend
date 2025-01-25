import dotenv from "dotenv";

dotenv.config()

const config = {
    PORT: process.env.PORT || 8000,
    ORIGIN_FRONTEND: process.env.ORIGIN_FRONTEND || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
    SALT: 10,
};

export default config;
