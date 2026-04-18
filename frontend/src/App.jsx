import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import { useThemeMode } from './context/themeContext';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const BlogsPage = lazy(() => import('./pages/admin/BlogsPage'));
const CreateBlogPage = lazy(() => import('./pages/admin/CreateBlogPage'));
const EditBlogPage = lazy(() => import('./pages/admin/EditBlogPage'));
const CommentsPage = lazy(() => import('./pages/admin/CommentsPage'));
const SubscribersPage = lazy(() => import('./pages/admin/SubscribersPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname, location.search]);
    return null;
}
export default function App() {
    const { theme, toggleTheme } = useThemeMode();
    const routeFallback = <div className="mx-auto max-w-screen-xl px-4 py-10 text-slate-500">Loading...</div>;

    return (<>
      <ScrollToTop />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />}/>
          <Route path="/admin/new-post" element={<Navigate to="/admin/create" replace/>}/>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace/>}/>
          <Route element={<Layout theme={theme} onToggleTheme={toggleTheme}/> }>
            <Route path="/" element={<HomePage />}/>
            <Route path="/blog" element={<BlogListPage />}/>
            <Route path="/blog/:slug" element={<BlogDetailPage />}/>
            <Route path="/about" element={<AboutPage />}/>
            <Route path="/subscribe" element={<SubscribePage />}/>
          </Route>
          <Route element={<AdminRouteGuard />}>
            <Route element={<AdminLayout theme={theme} onToggleTheme={toggleTheme}/> }>
              <Route path="/admin/dashboard" element={<DashboardPage />}/>
              <Route path="/admin/blogs" element={<BlogsPage />}/>
              <Route path="/admin/create" element={<CreateBlogPage />}/>
              <Route path="/admin/edit/:id" element={<EditBlogPage />}/>
              <Route path="/admin/comments" element={<CommentsPage />}/>
              <Route path="/admin/subscribers" element={<SubscribersPage />}/>
              <Route path="/admin/settings" element={<SettingsPage />}/>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />}/>
        </Routes>
      </Suspense>
      <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
                background: '#334155',
                color: '#fff',
            },
            success: {
                duration: 3000,
                iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                },
            },
            error: {
                duration: 4000,
                iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                },
            },
        }}/>
    </>);
}
