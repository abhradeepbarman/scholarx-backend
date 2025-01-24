import dotenv from "dotenv";
import express, { Request, Response, Application } from "express";
import logger from "./../logger";
import morgan from "morgan";

dotenv.config({
    path: "./.env",
});

const app: Application = express();
const port = process.env.PORT;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// morgan setup
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

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express...");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
