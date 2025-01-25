import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import logger from "./../logger";
import config from "./config";
import errorHandler from "./middleware/errorHandler";
import { authRoutes } from "./routes";

const app: Application = express();

/* -------------------Middlewares------------------- */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
    cors({
        origin: [config.ORIGIN_FRONTEND],
        credentials: true,
    })
);

/* -------------------Morgan Setup------------------- */
const morganFormat = ":method :url :status :response-time ms";
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    url: message.split(" ")[1],
                    status: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                };
                logger.info(JSON.stringify(logObject));
            },
        },
    })
);

/* -------------------test route------------------- */
app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Welcome to ScholarX 👋");
});

app.get("/healthcheck", (req: Request, res: Response) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        responseTime: process.hrtime(),
        timestamp: Date.now(),
    });
});

/* -------------------Routes----------------------- */
app.use("/api/v1/auth", authRoutes);

/* ----------------404 not found---------------- */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 404,
        message: "404 not found",
    });
});

/* -------------------Custom Middleware------------------- */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

app.listen(config.PORT, () => {
    console.log(`Server is running at http://localhost:${config.PORT}`);
});
