import { z } from 'zod';
export const adminLoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});
export const adminBlogSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1),
	excerpt: z.string().max(300).optional().or(z.literal('')),
	coverImage: z.string().url().optional().or(z.literal('')),
	category: z.string().min(1),
	tags: z.array(z.string().min(1)).max(10),
	metaTitle: z.string().max(60).optional().or(z.literal('')),
	metaDescription: z.string().max(160).optional().or(z.literal('')),
	featured: z.boolean().optional(),
	isPublished: z.boolean().optional(),
});
export const adminSettingsSchema = z.object({
	requireUserLogin: z.boolean(),
	allowUserSignup: z.boolean(),
	allowAnonymousComments: z.boolean(),
});
export function stripHtmlToText(html) {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}