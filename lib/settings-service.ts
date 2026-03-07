/**
 * Settings Service Layer
 * Business logic for settings operations
 */

import connectDB from '@/lib/db';
import Settings, { ISettings } from '@/models/Settings';

export class SettingsService {
  /**
   * Get or create default settings
   */
  static async getSettings(): Promise<ISettings> {
    await connectDB();

    let settings = await Settings.findOne({});

    // If no settings exist, create default ones
    if (!settings) {
      settings = await Settings.create({
        requireUserLogin: false,
        allowUserSignup: true,
        allowAnonymousComments: false,
      });
    }

    return settings;
  }

  /**
   * Update settings
   */
  static async updateSettings(updates: Partial<ISettings>): Promise<ISettings | null> {
    await connectDB();

    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
    });

    return settings;
  }

  /**
   * Check if user login is required
   */
  static async isUserLoginRequired(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.requireUserLogin;
  }

  /**
   * Check if signup is allowed
   */
  static async isSignupAllowed(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.allowUserSignup;
  }

  /**
   * Check if anonymous comments are allowed
   */
  static async areAnonymousCommentsAllowed(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.allowAnonymousComments;
  }
}
