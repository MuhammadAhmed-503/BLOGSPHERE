"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapData = bootstrapData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const Post_1 = require("../models/Post");
const SiteSetting_1 = require("../models/SiteSetting");
const User_1 = require("../models/User");
const slug_1 = require("../utils/slug");
const seedPosts_1 = require("../data/seedPosts");
function inferReadingTime(content) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}
async function bootstrapData() {
    const adminEmail = env_1.env.adminEmail.toLowerCase();
    const admin = await User_1.UserModel.findOne({ email: adminEmail });
    if (!admin) {
        const passwordHash = await bcryptjs_1.default.hash(env_1.env.adminPassword, 10);
        await User_1.UserModel.create({
            name: 'Administrator',
            email: adminEmail,
            passwordHash,
            role: 'admin',
            emailVerifiedAt: new Date(),
            isActive: true,
        });
    }
    else {
        const passwordMatches = admin.passwordHash
            ? await bcryptjs_1.default.compare(env_1.env.adminPassword, admin.passwordHash)
            : false;
        let changed = false;
        if (!passwordMatches) {
            admin.passwordHash = await bcryptjs_1.default.hash(env_1.env.adminPassword, 10);
            changed = true;
        }
        if (admin.role !== 'admin') {
            admin.role = 'admin';
            changed = true;
        }
        if (!admin.isActive) {
            admin.isActive = true;
            changed = true;
        }
        if (changed) {
            await admin.save();
            console.log(`Admin credentials synced for ${adminEmail}`);
        }
    }
    const existingPosts = await Post_1.PostModel.countDocuments();
    if (existingPosts === 0) {
        const adminUser = await User_1.UserModel.findOne({ email: adminEmail });
        const now = new Date().toISOString();
        await Post_1.PostModel.insertMany(seedPosts_1.seedPosts.map((post) => ({
            ...post,
            slug: post.slug || (0, slug_1.createSlug)(post.title),
            publishedAt: new Date(post.publishedAt ?? now),
            createdAt: new Date(post.createdAt ?? now),
            readingTime: post.readingTime ?? inferReadingTime(post.content),
            status: 'published',
            authorId: adminUser?._id,
            authorName: 'BlogSphere Editorial',
        })));
    }
    const settingsCount = await SiteSetting_1.SiteSettingModel.countDocuments();
    if (settingsCount === 0) {
        await SiteSetting_1.SiteSettingModel.create({
            siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
            logoUrl: '/logo.svg',
            contactEmail: env_1.env.adminEmail,
            tagline: 'Modern publishing platform',
        });
    }
}
