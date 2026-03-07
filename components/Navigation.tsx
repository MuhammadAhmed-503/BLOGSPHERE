'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Load user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    // Dispatch custom event to notify other components about user logout
    window.dispatchEvent(new Event('userStorageUpdated'));
  };

  const handleAuthSuccess = (user: { id: string; email: string; name: string }) => {
    setCurrentUser(user);
    // Dispatch custom event to notify other components about user login
    window.dispatchEvent(new Event('userStorageUpdated'));
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/subscribe', label: 'Subscribe' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="BlogSphere Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              BlogSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}

            {/* User Auth */}
            {mounted && (
              <>
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{currentUser.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile User Auth */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium justify-center"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
}
