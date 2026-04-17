"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const cloudinary_1 = require("../services/cloudinary");
const uploadRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
uploadRouter.post('/file', auth_1.authenticateRequest, auth_1.requireAdmin, upload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new appError_1.AppError('File is required', 400);
    }
    const folder = typeof req.body.folder === 'string' && req.body.folder.trim() ? req.body.folder.trim() : 'blog-saas/uploads';
    const requestedType = typeof req.body.resourceType === 'string' ? req.body.resourceType : 'auto';
    const resourceType = ['image', 'video', 'raw', 'auto'].includes(requestedType)
        ? requestedType
        : 'auto';
    const uploadResult = await (0, cloudinary_1.uploadAsset)(req.file.buffer, folder, resourceType);
    res.status(201).json({ success: true, data: uploadResult });
}));
uploadRouter.post('/image', auth_1.authenticateRequest, auth_1.requireAdmin, upload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new appError_1.AppError('Image file is required', 400);
    }
    const folder = typeof req.body.folder === 'string' && req.body.folder.trim() ? req.body.folder.trim() : 'blog-saas/uploads';
    const uploadResult = await (0, cloudinary_1.uploadImage)(req.file.buffer, folder);
    res.status(201).json({ success: true, data: uploadResult });
}));
exports.default = uploadRouter;
