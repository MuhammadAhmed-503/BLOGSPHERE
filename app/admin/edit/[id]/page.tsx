'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { FileText, Tag, Save, Eye, EyeOff, ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl min-h-[400px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  ),
});

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  isPublished: boolean;
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    featured: false,
    isPublished: false,
  });

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/edit/${params.id}`);
      const result = await response.json();

      if (result.success) {
        const blogData = result.data;
        setBlog(blogData);
        setFormData({
          title: blogData.title,
          content: blogData.content,
          excerpt: blogData.excerpt,
          coverImage: blogData.coverImage,
          category: blogData.category,
          tags: blogData.tags.join(', '),
          metaTitle: blogData.metaTitle,
          metaDescription: blogData.metaDescription,
          featured: blogData.featured,
          isPublished: blogData.isPublished,
        });
      } else {
        toast.error('Failed to fetch blog');
        router.push('/admin/blogs');
      }
    } catch {
      toast.error('An error occurred.');
      router.push('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const result = await res.json();
      if (result.success && result.data?.url) {
        setFormData((prev) => ({ ...prev, coverImage: result.data.url }));
        toast.success('Cover image uploaded!');
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!formData.content.trim() || formData.content === '<p></p>') { toast.error('Content is required'); return; }
    if (!formData.category.trim()) { toast.error('Category is required'); return; }
    setSaving(true);

    try {
      // Prepare tags array
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.replace(/<[^>]*>/g, ' ').trim().substring(0, 280) + '...',
        coverImage: formData.coverImage || 'https://placehold.co/1200x630?text=No+Cover',
        category: formData.category,
        tags: tagsArray,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
        featured: formData.featured,
        isPublished: publish !== undefined ? publish : formData.isPublished,
      };

      const response = await fetch(`/api/blogs/edit/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Blog updated successfully!');
        router.push('/admin/blogs');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to update blog');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/blogs"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Edit Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your blog post
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter blog title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
              placeholder="Write your blog post..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className="textarea"
              placeholder="Brief summary (max 300 characters)"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.excerpt.length}/300 characters
            </p>
          </div>
        </div>

        {/* Media & Categorization */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Media & Categorization
          </h2>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-colors mb-3"
              onClick={() => coverInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) handleCoverUpload(f); }}
            >
              {formData.coverImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.coverImage} alt="Cover" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFormData((p) => ({ ...p, coverImage: '' })); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-4 h-4" /></button>
                  <p className="text-sm text-gray-500 mt-2">Click to change</p>
                </div>
              ) : coverUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Click to upload or drag & drop</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 50MB</p>
                </>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }} />
            <div className="flex items-center gap-3 my-2"><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /><span className="text-xs text-gray-400">OR paste URL</span><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /></div>
            <input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} className="input" placeholder="https://example.com/image.jpg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Technology, Travel"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="javascript, react, nextjs"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            SEO Settings
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="input"
              placeholder="SEO optimized title (max 60 characters)"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.metaTitle.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              className="textarea"
              placeholder="SEO optimized description (max 160 characters)"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>
        </div>

        {/* Additional Options */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Additional Options
          </h2>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="featured"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Mark as featured post
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end sticky bottom-4">
          <div className="flex gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Link href="/admin/blogs" className="btn-secondary">Cancel</Link>
            {formData.isPublished ? (
              <button type="button" onClick={(e) => handleSubmit(e, false)} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium hover:bg-yellow-200 transition-colors" disabled={saving}>
                <EyeOff className="w-4 h-4" /> Unpublish
              </button>
            ) : (
              <button type="button" onClick={(e) => handleSubmit(e, false)} className="btn-secondary flex items-center gap-2" disabled={saving}>
                <Save className="w-4 h-4" /> Save Draft
              </button>
            )}
            <button type="submit" onClick={(e) => handleSubmit(e, true)} className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</> : <><Eye className="w-4 h-4" /> {formData.isPublished ? 'Update & Keep Published' : 'Publish'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
