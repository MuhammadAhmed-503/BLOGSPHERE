import { Schema, model, type InferSchemaType } from 'mongoose';

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new', index: true },
    readAt: { type: Date },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export type ContactMessage = InferSchemaType<typeof contactMessageSchema>;

export const ContactMessageModel = model('ContactMessage', contactMessageSchema);