import type {
  AdminDashboardMetrics,
  BlogPost,
  CommentItem,
  NewsletterSubscriber,
  PaginatedPosts,
  SiteSetting,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  message: string;
  details?: unknown;
}

function toQueryString(query: Record<string, string | number | boolean | undefined | null>) {
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!response.ok || !('success' in body) || body.success === false) {
    const message = 'message' in body && body.message ? body.message : 'Request failed';
    throw new Error(message);
  }

  return body.data;
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardMetrics> {
  return request<AdminDashboardMetrics>('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchAdminBlogs(
  token: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}
): Promise<PaginatedPosts> {
  const query = toQueryString({
    page: options.page,
    limit: options.limit,
    search: options.search,
    status: options.status,
    category: options.category,
    sort: options.sort,
    order: options.order,
  });

  return request<PaginatedPosts>(`/admin/posts${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchAdminBlogById(token: string, id: string): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAdminBlog(token: string, payload: Record<string, unknown>): Promise<BlogPost> {
  return request<BlogPost>('/admin/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlog(token: string, id: string, payload: Record<string, unknown>): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlog(token: string, id: string): Promise<void> {
  await request<{ message: string }>(`/admin/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setBlogStatus(token: string, id: string, status: 'draft' | 'published' | 'archived'): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminComments(
  token: string,
  options: { status?: string; blogId?: string } = {}
): Promise<CommentItem[]> {
  const query = toQueryString(options);

  return request<CommentItem[]>(`/admin/comments${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveAdminComment(token: string, id: string): Promise<CommentItem> {
  return request<CommentItem>(`/admin/comments/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateAdminComment(
  token: string,
  id: string,
  payload: { status?: 'pending' | 'approved' | 'rejected' | 'spam'; isPinned?: boolean }
): Promise<CommentItem> {
  return request<CommentItem>(`/admin/comments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminComment(token: string, id: string): Promise<void> {
  await request<{ message: string }>(`/admin/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchAdminSubscribers(
  token: string,
  options: { status?: string; verificationStatus?: string } = {}
): Promise<NewsletterSubscriber[]> {
  const query = toQueryString(options);

  return request<NewsletterSubscriber[]>(`/admin/subscribers${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteAdminSubscriber(token: string, id: string): Promise<void> {
  await request<{ message: string }>(`/admin/subscribers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function notifyAdminSubscribers(
  token: string,
  payload: { subject?: string; message?: string; postId?: string }
): Promise<{ sentTo: number }> {
  return request<{ sentTo: number }>('/admin/subscribers/notify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminSettings(token: string): Promise<SiteSetting> {
  return request<SiteSetting>('/admin/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateAdminSettings(token: string, payload: Partial<SiteSetting>): Promise<SiteSetting> {
  return request<SiteSetting>('/admin/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function uploadAdminFile(
  token: string,
  file: File,
  options: { resourceType?: 'image' | 'video' | 'raw' | 'auto'; folder?: string } = {}
): Promise<{ secure_url: string; public_id: string; resource_type: string }> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.resourceType) {
    formData.append('resourceType', options.resourceType);
  }

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  return request<{ secure_url: string; public_id: string; resource_type: string }>('/uploads/file', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}
