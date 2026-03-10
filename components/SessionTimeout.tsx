'use client';

import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_TIME = 1 * 60 * 1000; // Show warning at 1 minute

export default function SessionTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const resetTimeoutRef = useRef<(() => void) | null>(null);

  const logout = useCallback(async () => {
    // Remove warning if it exists
    const warning = document.getElementById('session-warning');
    if (warning) warning.remove();

    await signOut({ callbackUrl: '/admin/login' });
  }, []);

  const showWarning = useCallback(() => {
    // Show a toast or alert to the user
    const warning = document.createElement('div');
    warning.id = 'session-warning';
    warning.className = 'fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    warning.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <p class="font-semibold mb-2">Session Expiring</p>
          <p class="text-sm mb-4">Your session will expire in 1 minute due to inactivity. Click to stay logged in.</p>
          <button id="stay-logged-in" class="bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-800 text-white px-4 py-2 rounded text-sm font-medium">
            Stay Logged In
          </button>
        </div>
        <button id="close-warning" class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 ml-2">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(warning);

    const stayBtn = document.getElementById('stay-logged-in');
    const closeBtn = document.getElementById('close-warning');

    stayBtn?.addEventListener('click', () => {
      if (resetTimeoutRef.current) {
        resetTimeoutRef.current();
      }
      warning.remove();
    });

    closeBtn?.addEventListener('click', () => {
      warning.remove();
    });
  }, []);

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningShownRef.current = false;

    // Set warning timeout (9 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        showWarning();
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timeout (10 minutes)
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [showWarning, logout]);

  // Store resetTimeout in ref to avoid circular dependency
  useEffect(() => {
    resetTimeoutRef.current = resetTimeout;
  }, [resetTimeout]);

  useEffect(() => {
    // Reset timeout on component mount
    resetTimeout();

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [resetTimeout]);

  return null; // This component doesn't render anything
}
