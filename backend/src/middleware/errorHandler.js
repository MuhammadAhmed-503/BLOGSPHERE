"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const appError_1 = require("../utils/appError");
function notFoundHandler(_req, _res, next) {
    next(new appError_1.AppError('Route not found', 404));
}
function errorHandler(err, _req, res, _next) {
    const isAppError = err instanceof appError_1.AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (statusCode >= 500) {
        console.error(err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        details: isAppError ? err.details : undefined,
    });
}
