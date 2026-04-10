import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { pushSubscriptionSchema } from '../validators';
import { PushSubscriptionModel } from '../models/PushSubscription';
import { sendPushNotification } from '../services/push';
import { authenticateRequest, requireAdmin } from '../middleware/auth';

const pushRouter = Router();

pushRouter.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const parsed = pushSubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const subscription = await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: parsed.data.endpoint },
      {
        endpoint: parsed.data.endpoint,
        keys: parsed.data.keys,
        email: parsed.data.email,
        active: true,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, data: { id: String(subscription._id) } });
  })
);

pushRouter.post(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.body as { endpoint?: string };

    if (!endpoint) {
      throw new AppError('endpoint is required', 400);
    }

    const subscription = await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      { active: false },
      { new: true }
    );

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    res.json({ success: true, message: 'Push subscription removed' });
  })
);

pushRouter.post(
  '/test',
  authenticateRequest,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { endpoint, payload } = req.body as { endpoint?: string; payload?: Record<string, unknown> };

    if (!endpoint) {
      throw new AppError('endpoint is required', 400);
    }

    const subscription = await PushSubscriptionModel.findOne({ endpoint, active: true });

    if (!subscription) {
      throw new AppError('Push subscription not found', 404);
    }

    const keys = subscription.keys;

    if (!keys) {
      throw new AppError('Push subscription keys are missing', 500);
    }

    await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      },
      payload ?? { title: 'BlogSphere', body: 'This is a test notification.' }
    );

    res.json({ success: true, message: 'Push notification sent' });
  })
);

export default pushRouter;