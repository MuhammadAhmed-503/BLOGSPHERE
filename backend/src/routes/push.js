"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const validators_1 = require("../validators");
const PushSubscription_1 = require("../models/PushSubscription");
const push_1 = require("../services/push");
const auth_1 = require("../middleware/auth");
const pushRouter = (0, express_1.Router)();
pushRouter.post('/subscribe', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.pushSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const subscription = await PushSubscription_1.PushSubscriptionModel.findOneAndUpdate({ endpoint: parsed.data.endpoint }, {
        endpoint: parsed.data.endpoint,
        keys: parsed.data.keys,
        email: parsed.data.email,
        active: true,
    }, { new: true, upsert: true });
    res.status(201).json({ success: true, data: { id: String(subscription._id) } });
}));
pushRouter.post('/unsubscribe', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
        throw new appError_1.AppError('endpoint is required', 400);
    }
    const subscription = await PushSubscription_1.PushSubscriptionModel.findOneAndUpdate({ endpoint }, { active: false }, { new: true });
    if (!subscription) {
        throw new appError_1.AppError('Subscription not found', 404);
    }
    res.json({ success: true, message: 'Push subscription removed' });
}));
pushRouter.post('/test', auth_1.authenticateRequest, auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { endpoint, payload } = req.body;
    if (!endpoint) {
        throw new appError_1.AppError('endpoint is required', 400);
    }
    const subscription = await PushSubscription_1.PushSubscriptionModel.findOne({ endpoint, active: true });
    if (!subscription) {
        throw new appError_1.AppError('Push subscription not found', 404);
    }
    const keys = subscription.keys;
    if (!keys) {
        throw new appError_1.AppError('Push subscription keys are missing', 500);
    }
    await (0, push_1.sendPushNotification)({
        endpoint: subscription.endpoint,
        keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
        },
    }, payload ?? { title: 'BlogSphere', body: 'This is a test notification.' });
    res.json({ success: true, message: 'Push notification sent' });
}));
exports.default = pushRouter;
