import { Schema, model, type InferSchemaType } from 'mongoose';

const siteSettingSchema = new Schema(
  {
    siteName: { type: String, required: true, default: 'BlogSphere' },
    logoUrl: { type: String, default: '/logo.svg' },
    tagline: { type: String, default: 'Modern publishing platform' },
    contactEmail: { type: String, default: 'contact@blogplatform.com' },
    showFeaturedSection: { type: Boolean, default: true },
    showTrendingSection: { type: Boolean, default: true },
    showLatestSection: { type: Boolean, default: true },
    showNewsletterSection: { type: Boolean, default: true },
    requireUserLogin: { type: Boolean, default: false },
    allowUserSignup: { type: Boolean, default: true },
    allowAnonymousComments: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type SiteSetting = InferSchemaType<typeof siteSettingSchema>;

export const SiteSettingModel = model('SiteSetting', siteSettingSchema);