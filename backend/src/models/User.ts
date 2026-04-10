import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['admin', 'author', 'subscriber'], default: 'subscriber' },
    googleId: { type: String, index: true, sparse: true },
    avatarUrl: { type: String },
    bio: { type: String },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);