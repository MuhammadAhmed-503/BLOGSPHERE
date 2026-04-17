"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    coverImage: { type: String, required: true },
    publishedAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, required: true },
    readingTime: { type: Number, required: true, min: 1 },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    authorName: { type: String, default: 'Editorial Team' },
    authorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.PostModel = (0, mongoose_1.model)('Post', postSchema);
