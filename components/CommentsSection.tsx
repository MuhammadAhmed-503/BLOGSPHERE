'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { MessageCircle, Send, LogOut, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';

interface Comment {
  _id: string;
  name: string;
  email?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
  parentCommentId?: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface CommentsSectionProps {
  blogId: string;
}

interface Settings {
  requireUserLogin: boolean;
  allowUserSignup: boolean;
  allowAnonymousComments: boolean;
}

export default function CommentsSection({ blogId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // Simple form data (for anonymous comments)
  const [simpleFormData, setSimpleFormData] = useState({
    name: '',
    email: '',
  });

  // Load settings and local user on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      } else {
        setLocalUser(null);
      }
    };

    loadUserFromStorage();
    fetchSettings();

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUserFromStorage();
      }
    };

    // Listen for custom storage event (same tab)
    const handleStorageUpdated = () => {
      loadUserFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStorageUpdated', handleStorageUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStorageUpdated', handleStorageUpdated);
    };
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?blogId=${blogId}`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error('API Error:', data.message || 'Failed to fetch comments');
        setComments([]);
        setLoading(false);
        return;
      }

      if (data.success && data.data) {
        setComments(Array.isArray(data.data) ? data.data : []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  // Fetch comments on mount and when blogId changes
  useEffect(() => {
    fetchComments();
    // Refresh comments every 30 seconds
    const interval = setInterval(fetchComments, 30000);
    return () => clearInterval(interval);
  }, [fetchComments]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLocalUser(null);
  };

  const handleAuthSuccess = (user: User) => {
    setLocalUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check which user is commenting
    const user = session?.user || localUser;

    // If login is required but no user, show auth modal
    if (settings?.requireUserLogin && !user) {
      if (session?.user) {
        signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.href : undefined });
      } else {
        setShowAuthModal(true);
      }
      return;
    }

    // For anonymous comments, validate name at minimum
    if (!user && !settings?.allowAnonymousComments) {
      setErrorMessage('Please sign in to comment');
      return;
    }

    if (!user && simpleFormData.name.trim() === '') {
      setErrorMessage('Name is required');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          name: user?.name || simpleFormData.name,
          email: user?.email || (simpleFormData.email ? simpleFormData.email : undefined),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Comment posted!');
        setContent('');
        if (!user) {
          setSimpleFormData({ name: '', email: '' });
        }
        // Refresh comments immediately
        setTimeout(fetchComments, 300);
      } else {
        setErrorMessage(data.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setErrorMessage('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replySubmitting, setReplySubmitting] = useState(false);
    const user = session?.user || localUser;

    const handleReplySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyContent.trim()) return;

      setReplySubmitting(true);
      setErrorMessage('');

      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blogId,
            name: user?.name || simpleFormData.name,
            email: user?.email || simpleFormData.email,
            content: replyContent,
            parentCommentId: comment._id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to post reply');
          return;
        }

        setSuccessMessage('Reply posted! It will appear after admin approval.');
        setReplyContent('');
        setShowReplyForm(false);
        
        // Refresh comments
        setTimeout(() => {
          fetchComments();
          setSuccessMessage('');
        }, 2000);
      } catch {
        setErrorMessage('Network error. Please try again.');
      } finally {
        setReplySubmitting(false);
      }
    };

    return (
      <div className={`${depth > 0 ? 'ml-4 sm:ml-6 border-l-2 border-gray-300 dark:border-gray-700 pl-4' : ''} mb-4`}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {comment.name}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
              {comment.content}
            </p>
            <button
              onClick={() => {
                if (!user && settings?.requireUserLogin) {
                  setShowAuthModal(true);
                } else {
                  setShowReplyForm(!showReplyForm);
                }
              }}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>

            {/* Inline Reply Form */}
            {showReplyForm && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {user ? (
                  <form onSubmit={handleReplySubmit} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Replying as {user.name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                      required
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent('');
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={replySubmitting || !replyContent.trim()}
                        className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        <Send className="w-3 h-3" />
                        {replySubmitting ? 'Sending...' : 'Reply'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Sign in to reply to this comment
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const user = session?.user || localUser;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Discussion ({comments.length})
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Chat with the community about this post
        </p>
      </div>

      {/* Comment Input Area */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {!user ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {settings?.requireUserLogin ? 'Sign in to comment' : 'Join the discussion'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {settings?.requireUserLogin
                  ? 'Create an account or sign in with Google'
                  : 'Sign in for a quicker experience or comment anonymously'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {session ? (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Google
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  {settings?.allowUserSignup && (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign Up
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {successMessage && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                <span className="text-green-800 dark:text-green-200">{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="text-green-600 dark:text-green-400"
                >
                  ✕
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                <span className="text-red-800 dark:text-red-200">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-600 dark:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || user.email?.split('@')[0]}
                </p>
              </div>
            </div>

            <textarea
              id="comment-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}

        {/* Anonymous comment form (if allowed and no user) */}
        {!user && settings?.allowAnonymousComments && (
          <form onSubmit={handleSubmit} className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Or comment without signing up:
            </p>

            {errorMessage && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                <span className="text-red-800 dark:text-red-200">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-600 dark:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={simpleFormData.name}
                onChange={(e) =>
                  setSimpleFormData({ ...simpleFormData, name: e.target.value })
                }
                placeholder="Your name *"
                required
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <input
                type="email"
                value={simpleFormData.email}
                onChange={(e) =>
                  setSimpleFormData({ ...simpleFormData, email: e.target.value })
                }
                placeholder="Email (optional)"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <textarea
              id="comment-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
            />

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending...' : 'Post Comment'}
            </button>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-2">No comments yet</p>
            <p className="text-xs">Be the first to start the discussion!</p>
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
