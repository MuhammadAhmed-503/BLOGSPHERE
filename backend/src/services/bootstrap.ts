import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { PostModel } from '../models/Post';
import { SiteSettingModel } from '../models/SiteSetting';
import { UserModel } from '../models/User';
import { createSlug } from '../utils/slug';
import { seedPosts } from '../data/seedPosts';

function inferReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function bootstrapData(): Promise<void> {
  const adminEmail = env.adminEmail.toLowerCase();
  const admin = await UserModel.findOne({ email: adminEmail });

  if (!admin) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await UserModel.create({
      name: 'Administrator',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      emailVerifiedAt: new Date(),
      isActive: true,
    });
  } else {
    const passwordMatches = admin.passwordHash
      ? await bcrypt.compare(env.adminPassword, admin.passwordHash)
      : false;

    let changed = false;

    if (!passwordMatches) {
      admin.passwordHash = await bcrypt.hash(env.adminPassword, 10);
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

  const existingPosts = await PostModel.countDocuments();

  if (existingPosts === 0) {
    const adminUser = await UserModel.findOne({ email: adminEmail });
    const now = new Date().toISOString();

    await PostModel.insertMany(
      seedPosts.map((post) => ({
        ...post,
        slug: post.slug || createSlug(post.title),
        publishedAt: new Date(post.publishedAt ?? now),
        createdAt: new Date(post.createdAt ?? now),
        readingTime: post.readingTime ?? inferReadingTime(post.content),
        status: 'published',
        authorId: adminUser?._id,
        authorName: 'BlogSphere Editorial',
      }))
    );
  }

  const settingsCount = await SiteSettingModel.countDocuments();
  if (settingsCount === 0) {
    await SiteSettingModel.create({
      siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
      logoUrl: '/logo.svg',
      contactEmail: env.adminEmail,
      tagline: 'Modern publishing platform',
    });
  }
}