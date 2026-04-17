import { useState } from 'react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { saveAuthSession } from '../services/auth';
export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    if (!isOpen) {
        return null;
    }
    const handleSubmit = (event) => {
        void (async () => {
            event.preventDefault();
            setLoading(true);
            setError('');
            try {
                const trimmedEmail = formData.email.trim().toLowerCase();
                const trimmedPassword = formData.password.trim();
                const trimmedName = formData.name.trim();
                if (!trimmedEmail || !trimmedPassword || (!isLogin && !trimmedName)) {
                    setError('Please complete all required fields.');
                    return;
                }
                const authPayload = isLogin
                    ? await login({ email: trimmedEmail, password: trimmedPassword })
                    : await register({ name: trimmedName, email: trimmedEmail, password: trimmedPassword });
                saveAuthSession({
                    user: authPayload.user,
                    token: authPayload.token,
                });
                if (isLogin && authPayload.user.role === 'admin') {
                    toast.success('Admin logged in successfully');
                }
                else if (isLogin) {
                    toast.success('User logged in successfully');
                }
                else {
                    toast.success('Account created successfully');
                }
                onSuccess(authPayload.user);
                onClose();
                if (isLogin && authPayload.user.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Authentication failed';
                setError(message);
            }
            finally {
                setLoading(false);
            }
        })();
    };
    return (<div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-950/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (<div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (<div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Your name" className="input pl-10" required/>
              </div>
            </div>)}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
              <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="you@example.com" className="input pl-10" required/>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
              <input type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder={isLogin ? 'Enter password' : 'Create a password'} className="input pl-10" required/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight className="h-4 w-4"/>}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin((value) => !value)} className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close modal">
          ✕
        </button>
      </div>
    </div>);
}
