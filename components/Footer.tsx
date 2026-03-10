import Link from 'next/link';
import Image from 'next/image';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/logo.svg" alt="BlogSphere Logo" width={40} height={40} />
              <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                BlogSphere
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              A modern, scalable blogging platform built with Next.js, MongoDB, and TypeScript.
              Production-ready and optimized for performance.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Subscribe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>contact@blogplatform.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} BlogSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
