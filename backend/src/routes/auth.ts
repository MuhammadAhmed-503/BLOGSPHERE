import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { authenticateRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { signToken } from '../utils/jwt';

const authRouter = Router();
const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;

function buildUserResponse(user: { _id: unknown; name: string; email: string; role: string; avatarUrl?: string | null }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
  };
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };

    if (!email || !password || !name) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'subscriber',
      emailVerifiedAt: new Date(),
    });

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        user: buildUserResponse(user),
        token,
      },
    });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });

    res.json({
      success: true,
      data: {
        user: buildUserResponse(user),
        token,
      },
    });
  })
);

authRouter.post(
  '/google',
  asyncHandler(async (req, res) => {
    if (!googleClient) {
      throw new AppError('Google authentication is not configured', 503);
    }

    const { idToken } = req.body as { idToken?: string };

    if (!idToken) {
      throw new AppError('Google ID token is required', 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.google.clientId ?? undefined,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new AppError('Unable to verify Google account', 401);
    }

    const email = payload.email.toLowerCase();
    const name = payload.name ?? payload.given_name ?? 'Google User';
    const avatarUrl = payload.picture;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name,
        email,
        role: email === env.adminEmail.toLowerCase() ? 'admin' : 'subscriber',
        googleId: payload.sub,
        avatarUrl,
        emailVerifiedAt: new Date(),
      });
    } else {
      user.googleId = payload.sub;
      user.avatarUrl = avatarUrl ?? user.avatarUrl;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });

    res.json({
      success: true,
      data: {
        user: buildUserResponse(user),
        token,
      },
    });
  })
);

authRouter.get(
  '/me',
  authenticateRequest,
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.auth?.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: buildUserResponse(user),
    });
  })
);

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default authRouter;