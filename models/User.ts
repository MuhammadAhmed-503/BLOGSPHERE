/**
 * User Model
 * Admin authentication model with role-based access
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1, role: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
