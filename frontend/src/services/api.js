const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const inFlightPostRequests = new Map();
function toQueryString(query) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		params.set(key, String(value));
	}
	const encoded = params.toString();
	return encoded ? `?${encoded}` : '';
}
async function request(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		...options,
	});
	const body = (await response.json());
	if (!response.ok || !('success' in body) || body.success === false) {
		const message = 'message' in body && body.message ? body.message : 'Request failed';
		throw new Error(message);
	}
	return body.data;
}
export async function fetchHome() {
	return request('/public/home');
}
export async function fetchPosts(options) {
	const query = toQueryString({
		page: options.page,
		limit: options.limit,
		category: options.category,
		tag: options.tag,
		featured: options.featured,
		search: options.search,
	});
	return request(`/public/posts${query}`);
}
export async function fetchPostBySlug(slug) {
	if (inFlightPostRequests.has(slug)) {
		return inFlightPostRequests.get(slug);
	}
	const pendingRequest = request(`/public/posts/${encodeURIComponent(slug)}`);
	inFlightPostRequests.set(slug, pendingRequest);
	try {
		return await pendingRequest;
	} finally {
		if (inFlightPostRequests.get(slug) === pendingRequest) {
			inFlightPostRequests.delete(slug);
		}
	}
}
export async function fetchCategories() {
	return request('/public/categories');
}
export async function fetchTags() {
	return request('/public/tags');
}
export async function subscribeToNewsletter(payload) {
	return request('/public/newsletter/subscribe', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
export async function login(payload) {
	return request('/auth/login', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
export async function register(payload) {
	return request('/auth/register', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
export async function createPost(payload, token) {
	return request('/admin/posts', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});
}
export async function updatePost(postId, payload, token) {
	return request(`/admin/posts/${encodeURIComponent(postId)}`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});
}
export async function deletePost(postId, token) {
	await request(`/admin/posts/${encodeURIComponent(postId)}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
export async function fetchAdminPosts(token, options = {}) {
	const query = toQueryString({
		status: options.status,
		page: options.page,
		limit: options.limit,
	});
	return request(`/admin/posts${query}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
export async function changePostStatus(postId, status, token) {
	return request(`/admin/posts/${encodeURIComponent(postId)}/status`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ status }),
	});
}
export async function setPostFeatured(postId, featured, token) {
	return request(`/admin/posts/${encodeURIComponent(postId)}/feature`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ featured }),
	});
}
export async function fetchSiteSettings() {
	return request('/public/settings');
}
export async function fetchAdminSiteSettings(token) {
	return request('/admin/settings', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
export async function updateSiteSettings(payload, token) {
	return request('/admin/settings', {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});
}
export async function fetchPostComments(slug) {
	return request(`/public/posts/${encodeURIComponent(slug)}/comments`);
}
export async function createPostComment(slug, payload) {
	return request(`/public/posts/${encodeURIComponent(slug)}/comments`, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
export async function fetchAdminComments(token, status) {
	const query = toQueryString({ status });
	return request(`/admin/comments${query}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
export async function updateCommentModeration(commentId, payload, token) {
	return request(`/admin/comments/${encodeURIComponent(commentId)}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});
}
export async function deleteComment(commentId, token) {
	await request(`/admin/comments/${encodeURIComponent(commentId)}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
export async function uploadAdminFile(file, token, resourceType = 'auto') {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('resourceType', resourceType);
	const response = await fetch(`${API_BASE_URL}/uploads/file`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});
	const body = (await response.json());
	if (!response.ok || !('success' in body) || body.success === false) {
		throw new Error('message' in body && body.message ? body.message : 'Upload failed');
	}
	return body.data;
}