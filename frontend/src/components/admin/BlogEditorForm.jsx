import { useId, useMemo, useRef } from 'react';
import { CloudUpload, ImageOff, Loader2, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
function Counter({ value, max }) {
    return <span className={`text-xs font-medium ${value > max ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{value}/{max}</span>;
}
export default function BlogEditorForm({ value, onChange, onCancel, onSaveDraft, onPublish, onUploadEditorImage, onUploadCoverImage, loading, publishing, mode, }) {
    const coverInputId = useId();
    const coverInputRef = useRef(null);
    const excerptCount = value.excerpt.length;
    const metaTitleCount = value.metaTitle.length;
    const metaDescriptionCount = value.metaDescription.length;
    const coverPreview = useMemo(() => value.coverImage.trim(), [value.coverImage]);
    const updateField = (field, nextValue) => {
        onChange({ ...value, [field]: nextValue });
    };
    const handleCoverFile = async (file) => {
        if (!file) {
            return;
        }
        const uploadedUrl = await onUploadCoverImage(file);
        onChange({ ...value, coverImage: uploadedUrl });
    };
    return (<form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Basic Information</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Primary content and summary fields for the blog post.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="blog-title" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input id="blog-title" className="input" value={value.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Add a clear, compelling title"/>
          </div>

          <div>
            <label htmlFor="blog-content" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
            <RichTextEditor value={value.content} onChange={(next) => updateField('content', next)} onUploadImage={onUploadEditorImage} placeholder="Write the post body, add headings, embeds, and media..."/>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="blog-excerpt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Excerpt</label>
              <Counter value={excerptCount} max={300}/>
            </div>
            <textarea id="blog-excerpt" className="input min-h-[100px] resize-y" value={value.excerpt} onChange={(event) => updateField('excerpt', event.target.value)} placeholder="Short summary shown in cards and previews" maxLength={300}/>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cover Image</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload an image or paste a direct URL. Publishing requires a cover image.</p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-primary-400 hover:bg-primary-50/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-primary-500" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
            event.preventDefault();
            void handleCoverFile(event.dataTransfer.files?.[0]);
        }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                <CloudUpload className="h-6 w-6"/>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Drop image here or click to upload</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">PNG, JPG, or WEBP up to 50MB.</p>
              </div>
            </div>

            <button type="button" className="btn-secondary inline-flex items-center gap-2 self-start" onClick={() => coverInputRef.current?.click()}>
              <ImageOff className="h-4 w-4"/>
              Choose file
            </button>
          </div>

          <input ref={coverInputRef} id={coverInputId} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(event) => void handleCoverFile(event.target.files?.[0])}/>

          <div className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Or paste URL</div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <input className="input" type="url" value={value.coverImage} onChange={(event) => updateField('coverImage', event.target.value)} placeholder="https://example.com/cover-image.jpg"/>
            {value.coverImage && (<button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => updateField('coverImage', '')}>
                <X className="h-4 w-4"/>
                Remove
              </button>)}
          </div>

          {coverPreview && (<div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <img src={coverPreview} alt="Cover preview" className="h-56 w-full object-cover"/>
            </div>)}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Categorization</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the category and tags readers will use to find the post.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="blog-category" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <input id="blog-category" className="input" value={value.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Design, Growth, Operations..."/>
          </div>
          <div>
            <label htmlFor="blog-tags" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
            <input id="blog-tags" className="input" value={value.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="comma separated tags"/>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">SEO Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These values are used for search previews and social cards.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="blog-meta-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meta Title</label>
              <Counter value={metaTitleCount} max={60}/>
            </div>
            <input id="blog-meta-title" className="input" value={value.metaTitle} onChange={(event) => updateField('metaTitle', event.target.value)} placeholder="Defaults to title if empty" maxLength={60}/>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="blog-meta-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meta Description</label>
              <Counter value={metaDescriptionCount} max={160}/>
            </div>
            <input id="blog-meta-description" className="input" value={value.metaDescription} onChange={(event) => updateField('metaDescription', event.target.value)} placeholder="Defaults to excerpt or a generated snippet" maxLength={160}/>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Additional Options</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mark the post as featured to highlight it in cards and landing pages.</p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          <input type="checkbox" checked={value.featured} onChange={(event) => updateField('featured', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"/>
          Featured post
        </label>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {mode === 'create' ? 'Save as draft first or publish immediately.' : 'Update the content, then save or publish the current revision.'}
        </div>
      </section>

      <section className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onCancel} disabled={loading || publishing}>
            Cancel
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="btn-outline w-full sm:w-auto" onClick={onSaveDraft} disabled={loading || publishing}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Saving...</span> : mode === 'edit' ? 'Save Draft' : 'Save Draft'}
            </button>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={onPublish} disabled={loading || publishing}>
              {publishing ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Publishing...</span> : mode === 'edit' ? 'Update and Keep Published' : 'Publish'}
            </button>
          </div>
        </div>
      </section>
    </form>);
}
