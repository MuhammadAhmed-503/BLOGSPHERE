/**
 * Subscriber Delete API Route (Admin only)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api-response';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    await connectDB();
    const deleted = await Subscriber.findByIdAndDelete(params.id);
    if (!deleted) return notFoundResponse('Subscriber not found');

    return successResponse({ id: params.id }, 'Subscriber removed');
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return errorResponse('Failed to remove subscriber', 500);
  }
}
