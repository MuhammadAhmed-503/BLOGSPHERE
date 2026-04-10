import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import type { CurrentUser } from '../types';
import AuthModal from './AuthModal';
import { fetchSiteSettings } from '../lib/api';
import { clearAuthSession, getAuthSession, onAuthSessionChange } from '../lib/auth';

interface NavigationProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/subscribe', label: 'Subscribe' },
];

export default function Navigation({ theme, onToggleTheme }: NavigationProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [siteName, setSiteName] = useState('BlogSphere');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');

  useEffect(() => {
    setMounted(true);

    const syncUserState = () => {
      setCurrentUser(getAuthSession()?.user ?? null);
    };

    syncUserState();

    void (async () => {
      try {
        const settings = await fetchSiteSettings();
        if (settings.siteName) setSiteName(settings.siteName);
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
      } catch {
        // Keep defaults when settings are unavailable.
      }
    })();

    return onAuthSessionChange(syncUserState);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoUrl} alt={`${siteName} Logo`} className="h-10 w-10" />
              <span className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {siteName}
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {currentUser?.role === 'admin' && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`
                  }
                >
                  Admin Panel
                </NavLink>
              )}

              {mounted && (
                <button
                  onClick={onToggleTheme}
                  className="rounded-lg bg-slate-100 p-2 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
                </button>
              )}

              {mounted && (
                <>
                  {currentUser ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{currentUser.name}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
                    >
                      <User className="h-4 w-4" />
                      Login
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {mounted && (
                <button
                  onClick={onToggleTheme}
                  className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/55 md:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 sm:w-80 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt={`${siteName} Logo`} className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight text-primary-600 dark:text-primary-400">{siteName}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-3 font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-900 dark:hover:text-primary-400'}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {currentUser?.role === 'admin' && (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `mt-1 block rounded-lg px-3 py-3 font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-900 dark:hover:text-primary-400'}`
                }
              >
                Admin Panel
              </NavLink>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              {currentUser ? (
                <>
                  <div className="mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <User className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
