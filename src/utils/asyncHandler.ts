import { Request, Response, NextFunction } from "express";

const asyncHandler = <T>(
    requestHandler: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<T>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        });
    };
};

export default asyncHandler;