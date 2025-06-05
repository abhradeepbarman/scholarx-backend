import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";
import { formatError } from "../service/helper";

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next?: NextFunction
) => {
    let statusCode = 500;
    let errData = {
        message: "Internal Server Error",
    };

    console.error("Error:", err);

    if (err instanceof ZodError) {
        statusCode = 422;
        errData = {
            message: formatError(err),
        };
    }

    if (err instanceof CustomErrorHandler) {
        statusCode = err.status;
        errData = err.toJson();
    }

    return res
        .status(statusCode)
        .send(ResponseHandler(statusCode, errData.message));
};

export default errorHandler;
