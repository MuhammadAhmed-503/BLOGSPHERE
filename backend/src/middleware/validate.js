"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const appError_1 = require("../utils/appError");
function validateBody(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            next(new appError_1.AppError('Validation failed', 400, parsed.error.flatten()));
            return;
        }
        req.body = parsed.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            next(new appError_1.AppError('Invalid query parameters', 400, parsed.error.flatten()));
            return;
        }
        req.query = parsed.data;
        next();
    };
}
