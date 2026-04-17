"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const validators_1 = require("../validators");
const ContactMessage_1 = require("../models/ContactMessage");
const appError_1 = require("../utils/appError");
const email_1 = require("../services/email");
const env_1 = require("../config/env");
const contactRouter = (0, express_1.Router)();
contactRouter.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.contactSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const message = await ContactMessage_1.ContactMessageModel.create(parsed.data);
    await (0, email_1.sendMail)({
        to: env_1.env.adminEmail,
        subject: `New contact message from ${parsed.data.name}`,
        text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.subject}\n\n${parsed.data.message}`,
    });
    res.status(201).json({ success: true, data: { id: String(message._id) } });
}));
exports.default = contactRouter;
