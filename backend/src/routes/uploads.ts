import { Router } from 'express';
import multer from 'multer';
import { authenticateRequest, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { uploadAsset, uploadImage } from '../services/cloudinary';

const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post(
  '/file',
  authenticateRequest,
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    const folder = typeof req.body.folder === 'string' && req.body.folder.trim() ? req.body.folder.trim() : 'blog-saas/uploads';
    const requestedType = typeof req.body.resourceType === 'string' ? req.body.resourceType : 'auto';
    const resourceType = ['image', 'video', 'raw', 'auto'].includes(requestedType)
      ? (requestedType as 'image' | 'video' | 'raw' | 'auto')
      : 'auto';

    const uploadResult = await uploadAsset(req.file.buffer, folder, resourceType);
    res.status(201).json({ success: true, data: uploadResult });
  })
);

uploadRouter.post(
  '/image',
  authenticateRequest,
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const folder = typeof req.body.folder === 'string' && req.body.folder.trim() ? req.body.folder.trim() : 'blog-saas/uploads';
    const uploadResult = await uploadImage(req.file.buffer, folder);

    res.status(201).json({ success: true, data: uploadResult });
  })
);

export default uploadRouter;