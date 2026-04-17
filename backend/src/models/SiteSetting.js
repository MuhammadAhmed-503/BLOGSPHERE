"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingModel = void 0;
const mongoose_1 = require("mongoose");
const siteSettingSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.SiteSettingModel = (0, mongoose_1.model)('SiteSetting', siteSettingSchema);
