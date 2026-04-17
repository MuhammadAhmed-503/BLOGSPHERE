"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const jwt_1 = require("../utils/jwt");
const authRouter = (0, express_1.Router)();
const googleClient = env_1.env.google.clientId ? new google_auth_library_1.OAuth2Client(env_1.env.google.clientId) : null;
function buildUserResponse(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
    };
}
authRouter.post('/register', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        throw new appError_1.AppError('Name, email, and password are required', 400);
    }
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User_1.UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new appError_1.AppError('User already exists', 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.UserModel.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'subscriber',
        emailVerifiedAt: new Date(),
    });
    const token = (0, jwt_1.signToken)({ userId: String(user._id), email: user.email, role: user.role });
    res.status(201).json({
        success: true,
        data: {
            user: buildUserResponse(user),
            token,
        },
    });
}));
authRouter.post('/login', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new appError_1.AppError('Email and password are required', 400);
    }
    const user = await User_1.UserModel.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
        throw new appError_1.AppError('Invalid credentials', 401);
    }
    const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        throw new appError_1.AppError('Invalid credentials', 401);
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = (0, jwt_1.signToken)({ userId: String(user._id), email: user.email, role: user.role });
    res.json({
        success: true,
        data: {
            user: buildUserResponse(user),
            token,
        },
    });
}));
authRouter.post('/google', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!googleClient) {
        throw new appError_1.AppError('Google authentication is not configured', 503);
    }
    const { idToken } = req.body;
    if (!idToken) {
        throw new appError_1.AppError('Google ID token is required', 400);
    }
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env_1.env.google.clientId ?? undefined,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
        throw new appError_1.AppError('Unable to verify Google account', 401);
    }
    const email = payload.email.toLowerCase();
    const name = payload.name ?? payload.given_name ?? 'Google User';
    const avatarUrl = payload.picture;
    let user = await User_1.UserModel.findOne({ email });
    if (!user) {
        user = await User_1.UserModel.create({
            name,
            email,
            role: email === env_1.env.adminEmail.toLowerCase() ? 'admin' : 'subscriber',
            googleId: payload.sub,
            avatarUrl,
            emailVerifiedAt: new Date(),
        });
    }
    else {
        user.googleId = payload.sub;
        user.avatarUrl = avatarUrl ?? user.avatarUrl;
        user.lastLoginAt = new Date();
        await user.save();
    }
    const token = (0, jwt_1.signToken)({ userId: String(user._id), email: user.email, role: user.role });
    res.json({
        success: true,
        data: {
            user: buildUserResponse(user),
            token,
        },
    });
}));
authRouter.get('/me', auth_1.authenticateRequest, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.UserModel.findById(req.auth?.userId);
    if (!user) {
        throw new appError_1.AppError('User not found', 404);
    }
    res.json({
        success: true,
        data: buildUserResponse(user),
    });
}));
authRouter.post('/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});
exports.default = authRouter;
