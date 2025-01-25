import { ZodError } from "zod";

export const formatError = (error: ZodError): any => {
    let errors: any = {};
    error.errors.map((err) => {
        errors[err.path[0]] = err.message;
    });
    return errors;
};
