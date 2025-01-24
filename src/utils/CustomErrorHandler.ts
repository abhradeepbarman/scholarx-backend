class CustomErrorHandler extends Error {
    status: number;
    message: string;

    constructor(status: number, msg: string) {
        super();
        this.status = status;
        this.message = msg;
        Object.setPrototypeOf(this, CustomErrorHandler.prototype);
    }

    static alreadyExist(message: string): CustomErrorHandler {
        return new CustomErrorHandler(409, message);
    }

    static wrongCredentials(
        message: string = "Username or password is wrong!"
    ): CustomErrorHandler {
        return new CustomErrorHandler(401, message);
    }

    static unAuthorized(message: string = "unAuthorized"): CustomErrorHandler {
        return new CustomErrorHandler(403, message);
    }

    static notFound(message: string = "404 Not Found"): CustomErrorHandler {
        return new CustomErrorHandler(404, message);
    }

    static notAllowed(message: string = "403 Not Allowed"): CustomErrorHandler {
        return new CustomErrorHandler(401, message);
    }

    static serverError(
        message: string = "Internal server error"
    ): CustomErrorHandler {
        return new CustomErrorHandler(500, message);
    }

    toJson() {
        return {
            status: this.status,
            message: this.message,
        };
    }
}

export default CustomErrorHandler;
