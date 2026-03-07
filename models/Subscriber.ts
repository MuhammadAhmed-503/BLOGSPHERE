/**
 * Subscriber Model
 * Email subscription with verification and push notification support
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface ISubscriber extends Document {
  _id: Types.ObjectId;
  email: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  pushSubscription?: IPushSubscription;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationToken: {
      type: String,
      select: false, // Don't return by default
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    pushSubscription: {
      type: {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      },
      required: false,
      default: null,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SubscriberSchema.index({ email: 1, isVerified: 1 });
SubscriberSchema.index({ verificationTokenExpires: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;
