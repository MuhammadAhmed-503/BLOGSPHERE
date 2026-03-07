'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  LogOut,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/blogs', icon: FileText, label: 'Blogs' },
  { href: '/admin/create', icon: PlusCircle, label: 'Create Blog' },
  { href: '/admin/comments', icon: MessageSquare, label: 'Comments' },
  { href: '/admin/subscribers', icon: Users, label: 'Subscribers' },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pre-warm all admin routes for instant navigation
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.href !== pathname) {
        router.prefetch(item.href);
      }
    });
  }, [pathname, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-[60] md:hidden p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop - Mobile Only */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.svg"
            alt="BlogSphere Logo"
            width={40}
            height={40}
          />
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            BlogSphere
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
