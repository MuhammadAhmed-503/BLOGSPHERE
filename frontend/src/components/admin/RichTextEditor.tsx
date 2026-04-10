import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  CornerDownLeft,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Loader2,
  ListOrdered,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Unlink,
  Undo2,
  Youtube as YoutubeIcon,
} from 'lucide-react';

type UploadHandler = (file: File) => Promise<string>;

interface RichTextEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  onUploadImage?: UploadHandler;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, onUploadImage }: RichTextEditorProps) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [youtubePopoverOpen, setYoutubePopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write the article body here...',
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-slate max-w-none min-h-[400px] px-4 py-4 focus:outline-none dark:prose-invert dark:text-slate-100',
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.getHTML();

    if (value !== currentValue) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const uploadImage = async (file: File) => {
    if (!onUploadImage) {
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await onUploadImage(file);
      editor?.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    await uploadImage(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    await uploadImage(file);
  };

  const activeLink = useMemo(() => editor?.isActive('link') ?? false, [editor]);

  const applyLink = () => {
    if (!editor) {
      return;
    }

    const nextLink = linkUrl.trim();

    if (!nextLink) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkPopoverOpen(false);
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: nextLink }).run();
    setLinkPopoverOpen(false);
  };

  const applyYoutube = () => {
    if (!editor) {
      return;
    }

    const nextUrl = youtubeUrl.trim();

    if (!nextUrl) {
      setYoutubePopoverOpen(false);
      return;
    }

    editor.chain().focus().setYoutubeVideo({ src: nextUrl, width: 720, height: 405 }).run();
    setYoutubePopoverOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="sticky top-0 z-20 flex max-h-48 flex-wrap items-center gap-2 overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <ToolbarButton label="Paragraph" onClick={() => editor?.chain().focus().setParagraph().run()}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Heading 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <ToolbarButton label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')}>
            <span className="text-[10px] font-semibold">U</span>
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Inline code" onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')}>
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <ToolbarButton label="Align left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align right" onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align justify" onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })}>
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <ToolbarButton label="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
            <span className="text-sm font-semibold">•</span>
          </ToolbarButton>
          <ToolbarButton label="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}>
            <span className="text-sm font-semibold">&ldquo;</span>
          </ToolbarButton>
          <ToolbarButton label="Code block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')}>
            <Subscript className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <CornerDownLeft className="h-4 w-4 rotate-90" />
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <div className="relative">
            <ToolbarButton label="Add or remove link" onClick={() => {
              setLinkUrl(editor?.getAttributes('link')?.href ?? '');
              setLinkPopoverOpen((open) => !open);
              setYoutubePopoverOpen(false);
            }} active={activeLink}>
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            {linkPopoverOpen && (
              <div className="absolute left-0 top-11 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Link URL</label>
                <input className="input" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://" />
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn-primary flex-1 py-2 text-sm" onClick={applyLink}>Apply</button>
                  <button type="button" className="btn-secondary flex-1 py-2 text-sm" onClick={() => editor?.chain().focus().unsetLink().run()}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <ToolbarButton label="Remove link" onClick={() => editor?.chain().focus().unsetLink().run()} active={false}>
            <Unlink className="h-4 w-4" />
          </ToolbarButton>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !onUploadImage}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Upload image"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Image
          </button>

          <div className="relative">
            <ToolbarButton label="Embed YouTube video" onClick={() => {
              setYoutubeUrl('');
              setYoutubePopoverOpen((open) => !open);
              setLinkPopoverOpen(false);
            }}>
              <YoutubeIcon className="h-4 w-4" />
            </ToolbarButton>
            {youtubePopoverOpen && (
              <div className="absolute left-0 top-11 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">YouTube URL</label>
                <input className="input" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                <button type="button" className="btn-primary mt-3 w-full py-2 text-sm" onClick={applyYoutube}>
                  Embed Video
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Clear formatting" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

      <div
        className="relative max-h-[65vh] overflow-y-auto"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => void handleDrop(event)}
      >
        {uploading && (
          <div className="absolute inset-x-0 top-3 z-10 mx-auto flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading image
          </div>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
