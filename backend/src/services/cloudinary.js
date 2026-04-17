"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadAsset = uploadAsset;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
let configured = false;
function configureCloudinary() {
    if (configured) {
        return;
    }
    if (env_1.env.cloudinary.cloudName && env_1.env.cloudinary.apiKey && env_1.env.cloudinary.apiSecret) {
        cloudinary_1.v2.config({
            cloud_name: env_1.env.cloudinary.cloudName,
            api_key: env_1.env.cloudinary.apiKey,
            api_secret: env_1.env.cloudinary.apiSecret,
            secure: true,
        });
    }
    configured = true;
}
async function uploadImage(buffer, folder = 'blog-saas') {
    configureCloudinary();
    if (!env_1.env.cloudinary.cloudName || !env_1.env.cloudinary.apiKey || !env_1.env.cloudinary.apiSecret) {
        throw new Error('Cloudinary is not configured');
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
        }, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error('Cloudinary upload failed'));
                return;
            }
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
        });
        stream.end(buffer);
    });
}
async function uploadAsset(buffer, folder = 'blog-saas/uploads', resourceType = 'auto') {
    configureCloudinary();
    if (!env_1.env.cloudinary.cloudName || !env_1.env.cloudinary.apiKey || !env_1.env.cloudinary.apiSecret) {
        throw new Error('Cloudinary is not configured');
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: resourceType,
        }, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error('Cloudinary upload failed'));
                return;
            }
            resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
            });
        });
        stream.end(buffer);
    });
}
