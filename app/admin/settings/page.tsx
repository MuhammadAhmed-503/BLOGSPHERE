'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Settings {
  _id: string;
  requireUserLogin: boolean;
  allowUserSignup: boolean;
  allowAnonymousComments: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check if user is admin
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    // For now, assume all sessions are admin (you can enhance this with role checking)
    fetchSettings();
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessageType('error');
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof Settings) => {
    if (!settings) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: !settings[key],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSettings(data.data);
        setMessageType('success');
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessageType('error');
      setMessage('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Site Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure how your blog handles user authentication and comments
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              messageType === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            {messageType === 'success' ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span
              className={
                messageType === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }
            >
              {message}
            </span>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Require User Login */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Require User Login
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Users must sign in to post comments
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireUserLogin')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.requireUserLogin
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    settings.requireUserLogin ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded p-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">When enabled:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Visitors must sign up or sign in to comment</li>
                <li>Anonymous comments are disabled</li>
                <li>Only authenticated users see the comment form</li>
              </ul>
            </div>

            {/* Dependent Setting */}
            {settings.requireUserLogin && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Note:</span> Anonymous comments are automatically disabled when login is required
                </p>
              </div>
            )}
          </div>

          {/* Allow User Signup */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Allow User Signup
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New users can create accounts with email/password
                </p>
              </div>
              <button
                onClick={() => handleToggle('allowUserSignup')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.allowUserSignup
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    settings.allowUserSignup ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded p-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">When enabled:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Users see signup option in comments section</li>
                <li>New accounts created with email/password</li>
                <li>Works alongside Google OAuth option</li>
              </ul>
            </div>

            {!settings.allowUserSignup && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Tip:</span> Users can still sign in with Google OAuth
                </p>
              </div>
            )}
          </div>

          {/* Allow Anonymous Comments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Allow Anonymous Comments
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visitors can comment with just a name
                </p>
              </div>
              <button
                onClick={() => handleToggle('allowAnonymousComments')}
                disabled={saving || settings.requireUserLogin}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.allowAnonymousComments
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${
                  saving || settings.requireUserLogin
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    settings.allowAnonymousComments ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded p-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">When enabled:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Users can comment without signing in</li>
                <li>Only name field is required (email optional)</li>
                <li>Reduces friction for casual commenters</li>
              </ul>
            </div>

            {settings.requireUserLogin && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-800 dark:text-red-200">
                  <span className="font-semibold">Disabled:</span> Anonymous comments are unavailable when login is required
                </p>
              </div>
            )}
          </div>

          {/* Configuration Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Current Configuration
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Login Required
                </span>
                <span
                  className={`text-sm font-semibold ${
                    settings.requireUserLogin
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {settings.requireUserLogin ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Signup Allowed
                </span>
                <span
                  className={`text-sm font-semibold ${
                    settings.allowUserSignup
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {settings.allowUserSignup ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Anonymous Comments
                </span>
                <span
                  className={`text-sm font-semibold ${
                    settings.allowAnonymousComments
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {settings.allowAnonymousComments ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Presets Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Configuration Presets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Open Comments */}
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requireUserLogin: false,
                      allowUserSignup: true,
                      allowAnonymousComments: true,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSettings(data.data);
                    setMessageType('success');
                    setMessage('Applied "Open Comments" preset');
                    setTimeout(() => setMessage(''), 3000);
                  }
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Open Comments
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                No signup required, anyone can comment
              </p>
            </button>

            {/* Registered Only */}
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requireUserLogin: true,
                      allowUserSignup: true,
                      allowAnonymousComments: false,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSettings(data.data);
                    setMessageType('success');
                    setMessage('Applied "Registered Only" preset');
                    setTimeout(() => setMessage(''), 3000);
                  }
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Registered Only
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Users must create account to comment
              </p>
            </button>

            {/* Closed Comments */}
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requireUserLogin: true,
                      allowUserSignup: false,
                      allowAnonymousComments: false,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSettings(data.data);
                    setMessageType('success');
                    setMessage('Applied "Closed Comments" preset');
                    setTimeout(() => setMessage(''), 3000);
                  }
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Closed Comments
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                Only invited users can comment
              </p>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-semibold">Tip:</span> Changes apply immediately to all pages. Users must refresh their browser to see updated comment settings.
          </p>
        </div>
      </div>
    </div>
  );
}
