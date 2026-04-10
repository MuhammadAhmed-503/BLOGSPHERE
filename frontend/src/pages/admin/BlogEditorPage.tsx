import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BlogEditorForm, { type BlogEditorState } from '../../components/admin/BlogEditorForm';
import { adminBlogSchema, stripHtmlToText } from '../../lib/adminSchemas';
import {
  createAdminBlog,
  fetchAdminBlogById,
  updateAdminBlog,
  uploadAdminFile,
} from '../../lib/adminApi';
import { getAuthSession } from '../../lib/auth';
import { extractExcerpt } from '../../lib/utils';

interface BlogEditorPageProps {
  mode: 'create' | 'edit';
}

const draftCoverFallback = 'https://placehold.co/1280x720/f0f9ff/0c4a6e?text=Draft+Cover';

function createEmptyState(): BlogEditorState {
  return {
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
  };
}

export default function BlogEditorPage({ mode }: BlogEditorPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const session = getAuthSession();
  const blogId = params.id;
  const [formValue, setFormValue] = useState<BlogEditorState>(createEmptyState());
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (mode !== 'edit') {
      setInitialLoading(false);
      return;
    }

    if (!blogId || !session?.token) {
      navigate('/admin/blogs', { replace: true });
      return;
    }

    let active = true;

    void (async () => {
      try {
        const blog = await fetchAdminBlogById(session.token, blogId);

        if (!active) {
          return;
        }

        setFormValue({
          title: blog.title ?? '',
          content: blog.content ?? '',
          excerpt: blog.excerpt ?? '',
          coverImage: blog.coverImage ?? '',
          category: blog.category ?? '',
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
          metaTitle: blog.metaTitle ?? '',
          metaDescription: blog.metaDescription ?? '',
          featured: Boolean(blog.featured),
          isPublished: blog.status === 'published',
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load blog');
        navigate('/admin/blogs', { replace: true });
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [blogId, mode, navigate, session?.token]);

  const pageTitle = useMemo(() => (mode === 'create' ? 'Create Blog' : 'Edit Blog'), [mode]);

  const buildPayload = (publish: boolean) => {
    const tags = formValue.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
    const plainText = stripHtmlToText(formValue.content);
    const generatedExcerpt = extractExcerpt(plainText, 300);
    const excerpt = formValue.excerpt.trim() || generatedExcerpt;
    const coverImage = formValue.coverImage.trim() || (publish ? '' : draftCoverFallback);

    return {
      title: formValue.title.trim(),
      content: formValue.content.trim(),
      excerpt,
      coverImage,
      category: formValue.category.trim(),
      tags,
      metaTitle: formValue.metaTitle.trim() || formValue.title.trim(),
      metaDescription: formValue.metaDescription.trim() || excerpt || generatedExcerpt,
      featured: formValue.featured,
      status: publish ? 'published' : 'draft',
    };
  };

  const validatePayload = (payload: ReturnType<typeof buildPayload>, publish: boolean) => {
    const parsed = adminBlogSchema.safeParse({
      title: payload.title,
      content: payload.content,
      excerpt: payload.excerpt,
      coverImage: payload.coverImage,
      category: payload.category,
      tags: payload.tags,
      metaTitle: payload.metaTitle,
      metaDescription: payload.metaDescription,
      featured: payload.featured,
      isPublished: publish,
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Validation failed';
      throw new Error(message);
    }

    if (publish && !payload.coverImage) {
      throw new Error('A cover image is required before publishing.');
    }

    return payload;
  };

  const submitBlog = async (publish: boolean) => {
    if (!session?.token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const payload = validatePayload(buildPayload(publish), publish);

    if (!payload.title || !payload.content || !payload.category) {
      throw new Error('Title, content, and category are required.');
    }

    if (!publish && !payload.coverImage) {
      payload.coverImage = draftCoverFallback;
    }

    if (mode === 'create') {
      return publish ? createAdminBlog(session.token, payload) : createAdminBlog(session.token, payload);
    }

    if (!blogId) {
      throw new Error('Blog id is missing');
    }

    return updateAdminBlog(session.token, blogId, payload);
  };

  const handleSaveDraft = () => {
    void (async () => {
      try {
        setSaving(true);
        await submitBlog(false);
        toast.success(mode === 'create' ? 'Draft saved.' : 'Draft saved and unpublished.');
        navigate('/admin/blogs');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save draft');
      } finally {
        setSaving(false);
      }
    })();
  };

  const handlePublish = () => {
    void (async () => {
      try {
        setPublishing(true);
        await submitBlog(true);
        toast.success(mode === 'create' ? 'Blog published.' : 'Blog updated and published.');
        navigate('/admin/blogs');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to publish blog');
      } finally {
        setPublishing(false);
      }
    })();
  };

  const handleUploadEditorImage = async (file: File) => {
    if (!session?.token) {
      throw new Error('Authentication required');
    }

    const uploaded = await uploadAdminFile(session.token, file, { resourceType: 'image', folder: 'blog-saas/editor' });
    return uploaded.secure_url;
  };

  const handleUploadCoverImage = async (file: File) => {
    if (!session?.token) {
      throw new Error('Authentication required');
    }

    const uploaded = await uploadAdminFile(session.token, file, { resourceType: 'image', folder: 'blog-saas/covers' });
    return uploaded.secure_url;
  };

  if (initialLoading) {
    return (
      <div className="card p-6 text-slate-600 dark:text-slate-400">Loading editor...</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">{mode === 'create' ? 'New content' : 'Content management'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{pageTitle}</h1>
      </div>

      <BlogEditorForm
        mode={mode}
        value={formValue}
        onChange={setFormValue}
        onCancel={() => navigate('/admin/blogs')}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUploadEditorImage={handleUploadEditorImage}
        onUploadCoverImage={handleUploadCoverImage}
        loading={saving}
        publishing={publishing}
      />
    </div>
  );
}
