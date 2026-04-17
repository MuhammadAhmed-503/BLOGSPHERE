"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactMessageModel = void 0;
const mongoose_1 = require("mongoose");
const contactMessageSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new', index: true },
    readAt: { type: Date },
    repliedAt: { type: Date },
}, { timestamps: true });
exports.ContactMessageModel = (0, mongoose_1.model)('ContactMessage', contactMessageSchema);
