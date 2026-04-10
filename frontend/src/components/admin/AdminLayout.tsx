import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import type { CurrentUser } from '../../types';
import toast from 'react-hot-toast';
import { fetchSiteSettings } from '../../lib/api';
import { clearAuthSession, getAuthSession, touchAuthSession } from '../../lib/auth';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

interface AdminLayoutProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdminLayout({ theme, onToggleTheme }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState('BlogSphere');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  const session = getAuthSession();
  const currentUser = session?.user as CurrentUser;

  useEffect(() => {
    void (async () => {
      try {
        const settings = await fetchSiteSettings();
        if (settings.siteName) setSiteName(settings.siteName);
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
      } catch {
        // Keep the defaults if the public settings endpoint is unavailable.
      }
    })();
  }, []);

  useEffect(() => {
    const activityEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

    const onUserActivity = () => {
      touchAuthSession();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, onUserActivity, { passive: true });
    });

    const expirationCheck = window.setInterval(() => {
      const activeSession = getAuthSession();

      if (!activeSession) {
        clearAuthSession();
        toast.error('Session expired due to inactivity. Please sign in again.');
        navigate('/admin/login', { replace: true });
      }
    }, 15 * 1000);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onUserActivity);
      });
      window.clearInterval(expirationCheck);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AdminTopbar
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {currentUser && (
        <AdminSidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          currentUser={currentUser}
          siteName={siteName}
          logoUrl={logoUrl}
        />
      )}

      <main className="min-h-screen px-4 pt-16 pb-10 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 hidden justify-end lg:flex">
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
            </button>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
