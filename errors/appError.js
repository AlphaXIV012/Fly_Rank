class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}


class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}


class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}


module.exports = {
    AppError,
    BadRequestError,
    NotFoundError
};