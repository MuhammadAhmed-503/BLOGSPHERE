"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRequest = authenticateRequest;
exports.requireAdmin = requireAdmin;
const appError_1 = require("../utils/appError");
const jwt_1 = require("../utils/jwt");
function authenticateRequest(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        next(new appError_1.AppError('Authentication required', 401));
        return;
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        req.auth = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        next(new appError_1.AppError('Invalid or expired token', 401));
    }
}
function requireAdmin(req, _res, next) {
    if (!req.auth || req.auth.role !== 'admin') {
        next(new appError_1.AppError('Admin access required', 403));
        return;
    }
    next();
}
