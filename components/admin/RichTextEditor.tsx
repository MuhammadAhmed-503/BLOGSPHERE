'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, ImageIcon, Youtube as YoutubeIcon,
  Undo, Redo, Minus, Maximize2, Minimize2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your blog post...',
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [isInnerScrollable, setIsInnerScrollable] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
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
        HTMLAttributes: { class: 'text-primary-600 hover:underline' },
      }),
      Placeholder.configure({ placeholder }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  });

  // Sync external value changes (e.g. when editing existing blog loads content)
  const prevValueRef = useRef(value);
  if (editor && value !== prevValueRef.current && value !== editor.getHTML()) {
    prevValueRef.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }

  const handleImageUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const result = await res.json();
        if (result.success && result.data?.url) {
          editor?.chain().focus().setImage({ src: result.data.url, alt: file.name }).run();
          toast.success('Image uploaded!');
        } else {
          toast.error(result.message || 'Upload failed');
        }
      } catch {
        toast.error('Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor?.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const insertYoutube = () => {
    if (!youtubeUrl.trim()) return;
    editor?.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl('');
    setShowYoutubeInput(false);
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowYoutubeInput(false);
                setShowLinkInput((v) => !v);
              }
            }}
            active={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-72 flex gap-2">
              <input
                autoFocus
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
                className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button type="button" onClick={applyLink} className="btn-primary text-xs px-3 py-1">Add</button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Image"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* YouTube */}
        <div className="relative">
          <ToolbarButton
            onClick={() => { setShowLinkInput(false); setShowYoutubeInput((v) => !v); }}
            title="Embed YouTube Video"
          >
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>
          {showYoutubeInput && (
            <div className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-80 flex gap-2">
              <input
                autoFocus
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') insertYoutube(); if (e.key === 'Escape') setShowYoutubeInput(false); }}
                className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button type="button" onClick={insertYoutube} className="btn-primary text-xs px-3 py-1">Embed</button>
            </div>
          )}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Scrollable Mode Toggle */}
        <ToolbarButton
          onClick={() => setIsInnerScrollable(!isInnerScrollable)}
          active={isInnerScrollable}
          title={isInnerScrollable ? 'Normal Scroll Mode' : 'Inner Scroll Mode (Keeps toolbar visible)'}
        >
          {isInnerScrollable ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </ToolbarButton>
      </div>

      {/* Editor Body */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={isInnerScrollable ? 'h-[500px] overflow-y-auto' : 'min-h-[400px]'}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {uploading ? 'Uploading image...' : isInnerScrollable ? 'Inner scroll mode - Toolbar stays visible' : 'Drag & drop images directly into the editor'}
        </p>
        <p className="text-xs text-gray-400">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} chars
        </p>
      </div>
    </div>
  );
}
