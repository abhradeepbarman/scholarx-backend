function ResponseHandler(
    status: number,
    message: string,
    data?: object | null,
    success?: boolean
) {
    return {
        status,
        message,
        data,
        success: status >= 200 && status < 400,
    };
}

export default ResponseHandler;
