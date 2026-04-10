import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { contactSchema } from '../validators';
import { ContactMessageModel } from '../models/ContactMessage';
import { AppError } from '../utils/appError';
import { sendMail } from '../services/email';
import { env } from '../config/env';

const contactRouter = Router();

contactRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const message = await ContactMessageModel.create(parsed.data);

    await sendMail({
      to: env.adminEmail,
      subject: `New contact message from ${parsed.data.name}`,
      text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.subject}\n\n${parsed.data.message}`,
    });

    res.status(201).json({ success: true, data: { id: String(message._id) } });
  })
);

export default contactRouter;