/**
 * Image/Video Upload API — Cloudinary
 * Accepts multipart/form-data with a `file` field.
 * Returns { url, publicId, resourceType }
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // 50 MB limit
    if (file.size > 50 * 1024 * 1024) {
      return errorResponse('File too large (max 50 MB)', 400);
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/mov',
    ];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Unsupported file type', 400);
    }

    const isVideo = file.type.startsWith('video/');

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary via stream
    const result = await new Promise<{ secure_url: string; public_id: string; resource_type: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'blog-saas',
            resource_type: isVideo ? 'video' : 'image',
            quality: 'auto',
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as { secure_url: string; public_id: string; resource_type: string });
          }
        );
        uploadStream.end(buffer);
      }
    );

    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    }, 'File uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload file', 500);
  }
}
