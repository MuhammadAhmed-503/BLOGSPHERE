"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSubscriptionModel = void 0;
const mongoose_1 = require("mongoose");
const pushSubscriptionSchema = new mongoose_1.Schema({
    endpoint: { type: String, required: true, unique: true, index: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    email: { type: String, lowercase: true, trim: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    userAgent: { type: String },
    active: { type: Boolean, default: true },
}, { timestamps: true });
exports.PushSubscriptionModel = (0, mongoose_1.model)('PushSubscription', pushSubscriptionSchema);
