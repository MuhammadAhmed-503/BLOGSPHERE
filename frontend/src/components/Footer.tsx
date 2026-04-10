import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteSettings } from '../lib/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [siteName, setSiteName] = useState('BlogSphere');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [tagline, setTagline] = useState('A modern blogging experience rebuilt as a React SPA for static deployment.');
  const [contactEmail, setContactEmail] = useState('contact@blogplatform.com');

  useEffect(() => {
    void (async () => {
      try {
        const settings = await fetchSiteSettings();
        if (settings.siteName) setSiteName(settings.siteName);
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
        if (settings.tagline) setTagline(settings.tagline);
        if (settings.contactEmail) setContactEmail(settings.contactEmail);
      } catch {
        // Ignore settings load errors and keep defaults.
      }
    })();
  }, []);

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <img src={logoUrl} alt={`${siteName} Logo`} className="h-10 w-10" />
              <h3 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {siteName}
              </h3>
            </div>
            <p className="max-w-md text-slate-600 dark:text-slate-400">
              {tagline}
            </p>
            <div className="mt-6 flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="rounded-lg bg-slate-200 p-2 transition-colors hover:bg-primary-600 hover:text-white dark:bg-slate-800" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-lg bg-slate-200 p-2 transition-colors hover:bg-primary-600 hover:text-white dark:bg-slate-800" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="rounded-lg bg-slate-200 p-2 transition-colors hover:bg-primary-600 hover:text-white dark:bg-slate-800" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Quick Links</h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
              <li><Link to="/blog" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">Blog</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">About</Link></li>
              <li><Link to="/subscribe" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">Subscribe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Contact</h4>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              <span>{contactEmail}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
