"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    postSlug: { type: String, required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'spam'], default: 'pending', index: true },
    isPinned: { type: Boolean, default: false },
}, { timestamps: true });
exports.CommentModel = (0, mongoose_1.model)('Comment', commentSchema);
