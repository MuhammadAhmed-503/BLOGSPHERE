import { Schema, model, type InferSchemaType } from 'mongoose';

const pushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true, unique: true, index: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    email: { type: String, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userAgent: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type PushSubscription = InferSchemaType<typeof pushSubscriptionSchema>;

export const PushSubscriptionModel = model('PushSubscription', pushSubscriptionSchema);