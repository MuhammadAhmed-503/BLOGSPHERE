export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
  createdAt: string;
  readingTime: number;
  views: number;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  authorName?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'author' | 'subscriber';
  avatarUrl?: string | null;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface PaginatedPosts {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HomePayload {
  featuredPosts: BlogPost[];
  latestPosts: BlogPost[];
  trendingPosts: BlogPost[];
  categories: CategoryCount[];
  settings?: SiteSetting | null;
}

export interface AuthPayload {
  user: CurrentUser;
  token: string;
}

export interface AdminCreatePostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt?: string;
  createdAt?: string;
  readingTime?: number;
  authorName?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface SiteSetting {
  id: string;
  siteName: string;
  logoUrl: string;
  tagline?: string;
  contactEmail?: string;
  showFeaturedSection?: boolean;
  showTrendingSection?: boolean;
  showLatestSection?: boolean;
  showNewsletterSection?: boolean;
  requireUserLogin?: boolean;
  allowUserSignup?: boolean;
  allowAnonymousComments?: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  postSlug: string;
  postTitle?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed';
  verificationStatus?: 'pending' | 'verified';
  source?: string;
  topics?: string[];
  subscribedAt?: string;
  unsubscribedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDashboardMetrics {
  posts: number;
  publishedPosts: number;
  draftPosts: number;
  subscribers: number;
  messages: number;
  users: number;
  comments: number;
  pendingComments: number;
  totalViews: number;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  date: string;
  status: 'published' | 'draft' | 'pending' | 'approved' | 'subscribed' | 'unsubscribed';
  description?: string;
}
