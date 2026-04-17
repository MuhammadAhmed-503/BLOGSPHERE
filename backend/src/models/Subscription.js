"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed', index: true },
    verificationStatus: { type: String, enum: ['pending', 'verified'], default: 'verified', index: true },
    source: { type: String, default: 'website' },
    topics: [{ type: String }],
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
}, { timestamps: true });
exports.SubscriptionModel = (0, mongoose_1.model)('Subscription', subscriptionSchema);
