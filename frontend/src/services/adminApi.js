function normalizeApiBaseUrl(rawValue) {
	const fallback = '/api';
	if (!rawValue || typeof rawValue !== 'string') {
		return fallback;
	}

	const trimmed = rawValue.trim().replace(/\/+$/, '');
	if (!trimmed) {
		return fallback;
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
	}

	return trimmed;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? '/api');
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
	const headers = new Headers(options.headers ?? {});
	if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
	});
	const body = (await response.json());
	if (!response.ok || !('success' in body) || body.success === false) {
		const message = 'message' in body && body.message ? body.message : 'Request failed';
		throw new Error(message);
	}
	return body.data;
}
export async function fetchAdminDashboard(token) {
	return request('/admin/dashboard', {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function fetchAdminBlogs(token, options = {}) {
	const query = toQueryString({
		page: options.page,
		limit: options.limit,
		search: options.search,
		status: options.status,
		category: options.category,
		sort: options.sort,
		order: options.order,
	});
	return request(`/admin/posts${query}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function fetchAdminBlogById(token, id) {
	return request(`/admin/posts/${encodeURIComponent(id)}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function createAdminBlog(token, payload) {
	return request('/admin/posts', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});
}
export async function updateAdminBlog(token, id, payload) {
	return request(`/admin/posts/${encodeURIComponent(id)}`, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});
}
export async function deleteAdminBlog(token, id) {
	await request(`/admin/posts/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function setBlogStatus(token, id, status) {
	return request(`/admin/posts/${encodeURIComponent(id)}/status`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify({ status }),
	});
}
export async function fetchAdminComments(token, options = {}) {
	const query = toQueryString(options);
	return request(`/admin/comments${query}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function approveAdminComment(token, id) {
	return request(`/admin/comments/${encodeURIComponent(id)}/approve`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function updateAdminComment(token, id, payload) {
	return request(`/admin/comments/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});
}
export async function deleteAdminComment(token, id) {
	await request(`/admin/comments/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function fetchAdminSubscribers(token, options = {}) {
	const query = toQueryString(options);
	return request(`/admin/subscribers${query}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function deleteAdminSubscriber(token, id) {
	await request(`/admin/subscribers/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function notifyAdminSubscribers(token, payload) {
	return request('/admin/subscribers/notify', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});
}
export async function fetchAdminSettings(token) {
	return request('/admin/settings', {
		headers: { Authorization: `Bearer ${token}` },
	});
}
export async function updateAdminSettings(token, payload) {
	return request('/admin/settings', {
		method: 'PUT',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});
}
export async function uploadAdminFile(token, file, options = {}) {
	const formData = new FormData();
	formData.append('file', file);
	if (options.resourceType) {
		formData.append('resourceType', options.resourceType);
	}
	if (options.folder) {
		formData.append('folder', options.folder);
	}
	return request('/uploads/file', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});
}