import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import AboutPage from './pages/AboutPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogListPage from './pages/BlogListPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import SubscribePage from './pages/SubscribePage';
import { useThemeMode } from './context/themeContext';
import AdminLoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BlogsPage from './pages/admin/BlogsPage';
import CreateBlogPage from './pages/admin/CreateBlogPage';
import EditBlogPage from './pages/admin/EditBlogPage';
import CommentsPage from './pages/admin/CommentsPage';
import SubscribersPage from './pages/admin/SubscribersPage';
import SettingsPage from './pages/admin/SettingsPage';
function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname, location.search]);
    return null;
}
export default function App() {
    const { theme, toggleTheme } = useThemeMode();
    return (<>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />}/>
        <Route path="/admin/new-post" element={<Navigate to="/admin/create" replace/>}/>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace/>}/>
        <Route element={<Layout theme={theme} onToggleTheme={toggleTheme}/>}>
          <Route path="/" element={<HomePage />}/>
          <Route path="/blog" element={<BlogListPage />}/>
          <Route path="/blog/:slug" element={<BlogDetailPage />}/>
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/subscribe" element={<SubscribePage />}/>
        </Route>
        <Route element={<AdminRouteGuard />}>
          <Route element={<AdminLayout theme={theme} onToggleTheme={toggleTheme}/>}>
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
