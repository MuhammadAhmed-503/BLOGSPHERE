import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../services/api';
import { saveAuthSession } from '../../services/auth';
export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = (event) => {
        void (async () => {
            event.preventDefault();
            setLoading(true);
            try {
                const payload = await login({ email: email.trim().toLowerCase(), password: password.trim() });
                const user = payload.user;
                if (user.role !== 'admin') {
                    throw new Error('Admin access required');
                }
                saveAuthSession({ user, token: payload.token });
                toast.success('Admin logged in successfully');
                navigate('/admin/dashboard', { replace: true });
            }
            catch (error) {
                toast.error('Invalid email or password');
            }
            finally {
                setLoading(false);
            }
        })();
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 px-4 py-12 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur dark:bg-slate-950/90">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary-700 dark:text-primary-300">Admin Access</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Use your administrator account to manage content, comments, and settings.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900 dark:border-primary-900/60 dark:bg-primary-950/40 dark:text-primary-200">
          <p className="font-semibold">Demo credentials</p>
          <p className="mt-1">Use the admin email configured in your backend environment and its password.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
              <input id="admin-email" type="email" className="input pl-10" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@company.com" required/>
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
              <input id="admin-password" type="password" className="input pl-10" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required/>
            </div>
          </div>

          <button type="submit" className="btn-primary flex w-full items-center justify-center" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>);
}
