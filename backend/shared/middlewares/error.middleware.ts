import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors  
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Global error handler middleware
 * Catches all errors and sends formatted response
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging
    console.error('[ERROR]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Send response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper - eliminates need for try/catch in routes
 * Usage: router.get('/path', catchAsync(yourAsyncController))
 */
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
