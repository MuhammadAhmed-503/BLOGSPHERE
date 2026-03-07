/**
 * Settings API Routes - Admin only
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SettingsService } from '@/lib/settings-service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * GET /api/settings
 * Get public settings (no auth required)
 */
export async function GET() {
  try {
    const settings = await SettingsService.getSettings();

    return successResponse({
      requireUserLogin: settings.requireUserLogin,
      allowUserSignup: settings.allowUserSignup,
      allowAnonymousComments: settings.allowAnonymousComments,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

/**
 * PUT /api/settings
 * Update settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const body = await request.json();

    const updated = await SettingsService.updateSettings({
      requireUserLogin: body.requireUserLogin ?? false,
      allowUserSignup: body.allowUserSignup ?? true,
      allowAnonymousComments: body.allowAnonymousComments ?? false,
    });

    return successResponse(updated, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
