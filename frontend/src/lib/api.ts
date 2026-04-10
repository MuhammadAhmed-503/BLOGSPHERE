import type {
  AdminCreatePostInput,
  AuthPayload,
  BlogPost,
  CategoryCount,
  CommentItem,
  HomePayload,
  PaginatedPosts,
  SiteSetting,
  TagCount,
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const body = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!response.ok || !('success' in body) || body.success === false) {
    const message = 'message' in body && body.message ? body.message : 'Request failed';
    throw new Error(message);
  }

  return body.data;
}

export async function fetchHome(): Promise<HomePayload> {
  return request<HomePayload>('/public/home');
}

export async function fetchPosts(options: {
  page?: number;
  limit?: number;
  category?: string | null;
  tag?: string | null;
  featured?: boolean;
  search?: string;
}): Promise<PaginatedPosts> {
  const query = toQueryString({
    page: options.page,
    limit: options.limit,
    category: options.category,
    tag: options.tag,
    featured: options.featured,
    search: options.search,
  });

  return request<PaginatedPosts>(`/public/posts${query}`);
}

export async function fetchPostBySlug(slug: string): Promise<{ post: BlogPost; relatedPosts: BlogPost[] }> {
  return request<{ post: BlogPost; relatedPosts: BlogPost[] }>(`/public/posts/${encodeURIComponent(slug)}`);
}

export async function fetchCategories(): Promise<CategoryCount[]> {
  return request<CategoryCount[]>('/public/categories');
}

export async function fetchTags(): Promise<TagCount[]> {
  return request<TagCount[]>('/public/tags');
}

export async function subscribeToNewsletter(payload: { email: string; name?: string; topics?: string[] }) {
  return request<{ id: string }>('/public/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }): Promise<AuthPayload> {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: { name: string; email: string; password: string }): Promise<AuthPayload> {
  return request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createPost(payload: AdminCreatePostInput, token: string): Promise<BlogPost> {
  return request<BlogPost>('/admin/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updatePost(postId: string, payload: Partial<AdminCreatePostInput>, token: string): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(postId)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deletePost(postId: string, token: string): Promise<void> {
  await request<{ message: string }>(`/admin/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchAdminPosts(token: string, options: { status?: string; page?: number; limit?: number } = {}) {
  const query = toQueryString({
    status: options.status,
    page: options.page,
    limit: options.limit,
  });

  return request<PaginatedPosts>(`/admin/posts${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function changePostStatus(postId: string, status: 'draft' | 'published' | 'archived', token: string): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(postId)}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function setPostFeatured(postId: string, featured: boolean, token: string): Promise<BlogPost> {
  return request<BlogPost>(`/admin/posts/${encodeURIComponent(postId)}/feature`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ featured }),
  });
}

export async function fetchSiteSettings(): Promise<SiteSetting> {
  return request<SiteSetting>('/public/settings');
}

export async function fetchAdminSiteSettings(token: string): Promise<SiteSetting> {
  return request<SiteSetting>('/admin/settings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateSiteSettings(payload: Partial<SiteSetting>, token: string): Promise<SiteSetting> {
  return request<SiteSetting>('/admin/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchPostComments(slug: string): Promise<CommentItem[]> {
  return request<CommentItem[]>(`/public/posts/${encodeURIComponent(slug)}/comments`);
}

export async function createPostComment(
  slug: string,
  payload: { authorName: string; authorEmail: string; content: string }
): Promise<CommentItem> {
  return request<CommentItem>(`/public/posts/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminComments(token: string, status?: string): Promise<CommentItem[]> {
  const query = toQueryString({ status });
  return request<CommentItem[]>(`/admin/comments${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCommentModeration(
  commentId: string,
  payload: { status?: 'pending' | 'approved' | 'rejected' | 'spam'; isPinned?: boolean },
  token: string
): Promise<CommentItem> {
  return request<CommentItem>(`/admin/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteComment(commentId: string, token: string): Promise<void> {
  await request<{ message: string }>(`/admin/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function uploadAdminFile(
  file: File,
  token: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<{ secure_url: string; public_id: string; resource_type: string }> {
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

  const body = (await response.json()) as ApiEnvelope<{ secure_url: string; public_id: string; resource_type: string }> | ApiErrorEnvelope;

  if (!response.ok || !('success' in body) || body.success === false) {
    throw new Error('message' in body && body.message ? body.message : 'Upload failed');
  }

  return body.data;
}