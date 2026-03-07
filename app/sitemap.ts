import { MetadataRoute } from 'next';
import { BlogService } from '@/lib/blog-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get all published blogs
  const blogs = await BlogService.getBlogs({
    isPublished: true,
    limit: 1000,
  });

  // Blog URLs
  const blogUrls = blogs.blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static URLs
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...blogUrls];
}
