import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText, ExternalLink, Gauge, MessageSquareText, PenSquare, Settings, Users, } from 'lucide-react';
import { clearAuthSession } from '../../services/auth';
const navigationItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
    { to: '/admin/blogs', label: 'Blogs', icon: BookOpenText },
    { to: '/admin/create', label: 'Create Blog', icon: PenSquare },
    { to: '/admin/comments', label: 'Comments', icon: MessageSquareText },
    { to: '/admin/subscribers', label: 'Subscribers', icon: Users },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
];
export default function AdminSidebar({ open, onClose, currentUser, siteName = 'BlogSphere', logoUrl = '/logo.svg' }) {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        onClose();
    }, [location.pathname, onClose]);
    const handleLogout = () => {
        clearAuthSession();
        navigate('/admin/login', { replace: true });
    };
    return (<>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-6 dark:border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
              <img src={logoUrl} alt={`${siteName} logo`} className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"/>
              <div>
                <p className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">{siteName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => {
            const Icon = item.icon;
            return (<NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'}`}>
                  <Icon className="h-5 w-5"/>
                  {item.label}
                </NavLink>);
        })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            </div>

            <Link to="/" target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <ExternalLink className="h-4 w-4"/>
              View Website
            </Link>

            <button type="button" onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              <ArrowRight className="h-4 w-4"/>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {open && <button type="button" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onClose} aria-label="Close sidebar backdrop"/>}
    </>);
}
