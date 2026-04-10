import { Schema, model, type InferSchemaType } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed', index: true },
    verificationStatus: { type: String, enum: ['pending', 'verified'], default: 'verified', index: true },
    source: { type: String, default: 'website' },
    topics: [{ type: String }],
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

export type Subscription = InferSchemaType<typeof subscriptionSchema>;

export const SubscriptionModel = model('Subscription', subscriptionSchema);