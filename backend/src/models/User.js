"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['admin', 'author', 'subscriber'], default: 'subscriber' },
    googleId: { type: String, index: true, sparse: true },
    avatarUrl: { type: String },
    bio: { type: String },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
