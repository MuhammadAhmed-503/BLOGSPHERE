/**
 * Settings Model
 * Stores blog-wide configuration settings
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISettings extends Document {
  requireUserLogin: boolean;
  allowUserSignup: boolean;
  allowAnonymousComments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    requireUserLogin: {
      type: Boolean,
      default: false,
      description: 'Require users to login to comment',
    },
    allowUserSignup: {
      type: Boolean,
      default: true,
      description: 'Allow new users to sign up',
    },
    allowAnonymousComments: {
      type: Boolean,
      default: false,
      description: 'Allow comments without login (simple name/email form)',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
SettingsSchema.index({ _id: 1 }, { unique: true });

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
