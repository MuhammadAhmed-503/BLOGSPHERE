import { useEffect, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import { fetchAdminSettings, updateAdminSettings } from '../../lib/adminApi';
import { getAuthSession } from '../../lib/auth';
import type { SiteSetting } from '../../types';

const openCommentsPreset = { requireUserLogin: false, allowUserSignup: true, allowAnonymousComments: true };
const registeredOnlyPreset = { requireUserLogin: true, allowUserSignup: true, allowAnonymousComments: false };
const closedCommentsPreset = { requireUserLogin: true, allowUserSignup: false, allowAnonymousComments: false };

export default function SettingsPage() {
  const session = getAuthSession();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const nextSettings = await fetchAdminSettings(session.token);
        setSettings(nextSettings);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load settings';
        setBanner({ type: 'error', message });
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.token]);

  const persist = (next: Partial<SiteSetting>, key: string) => {
    if (!session?.token) {
      return;
    }

    void (async () => {
      setSavingKey(key);
      setBanner(null);

      try {
        const updated = await updateAdminSettings(session.token, next);
        setSettings(updated);
        setBanner({ type: 'success', message: 'Settings saved successfully.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save settings';
        setBanner({ type: 'error', message });
        toast.error(message);
      } finally {
        setSavingKey(null);
      }
    })();
  };

  const toggle = (key: keyof Pick<SiteSetting, 'requireUserLogin' | 'allowUserSignup' | 'allowAnonymousComments'>) => {
    if (!settings) {
      return;
    }

    const nextValue = !Boolean(settings[key]);
    const nextSettings: Partial<SiteSetting> = { ...settings, [key]: nextValue };

    if (key === 'requireUserLogin' && nextValue) {
      nextSettings.allowAnonymousComments = false;
    }

    if (key === 'allowAnonymousComments' && settings.requireUserLogin) {
      return;
    }

    persist(nextSettings, key);
  };

  const applyPreset = (preset: Partial<SiteSetting>) => {
    if (!settings) {
      return;
    }

    persist({ ...settings, ...preset }, 'preset');
  };

  const dependencyNotice = settings?.requireUserLogin
    ? 'Anonymous comments are disabled because user login is required.'
    : 'Anonymous comments can be enabled while login is optional.';

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Settings"
        subtitle="Control access, signup rules, and commenting behavior from one place."
      />

      {banner && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${banner.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'}`}>
          {banner.message}
        </div>
      )}

      {loading ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">Loading settings...</div>
      ) : settings ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            <ToggleSwitch
              label="Require User Login"
              description="When enabled, readers must be authenticated before interacting with protected features."
              checked={Boolean(settings.requireUserLogin)}
              onChange={() => toggle('requireUserLogin')}
              disabled={savingKey === 'requireUserLogin'}
            />

            <ToggleSwitch
              label="Allow User Signup"
              description="Permit new users to create accounts from the public site."
              checked={Boolean(settings.allowUserSignup)}
              onChange={() => toggle('allowUserSignup')}
              disabled={savingKey === 'allowUserSignup'}
            />

            <ToggleSwitch
              label="Allow Anonymous Comments"
              description="Let visitors post comments without logging in."
              checked={Boolean(settings.allowAnonymousComments)}
              onChange={() => toggle('allowAnonymousComments')}
              disabled={savingKey === 'allowAnonymousComments' || Boolean(settings.requireUserLogin)}
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {dependencyNotice}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Current Configuration</h2>
            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Require Login:</span> {settings.requireUserLogin ? 'Enabled' : 'Disabled'}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Allow Signup:</span> {settings.allowUserSignup ? 'Enabled' : 'Disabled'}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Anonymous Comments:</span> {settings.allowAnonymousComments ? 'Enabled' : 'Disabled'}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Theme:</span> Class-based dark mode</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <button type="button" onClick={() => applyPreset(openCommentsPreset)} className="card p-5 text-left transition-shadow hover:shadow-lg">
              <div className="mb-3 inline-flex rounded-2xl bg-primary-50 p-3 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"><Sparkles className="h-5 w-5" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Open Comments</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Login off, signup on, anonymous comments on.</p>
            </button>

            <button type="button" onClick={() => applyPreset(registeredOnlyPreset)} className="card p-5 text-left transition-shadow hover:shadow-lg">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Shield className="h-5 w-5" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Registered Only</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Login on, signup on, anonymous comments off.</p>
            </button>

            <button type="button" onClick={() => applyPreset(closedCommentsPreset)} className="card p-5 text-left transition-shadow hover:shadow-lg">
              <div className="mb-3 inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"><Shield className="h-5 w-5" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Closed Comments</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Login on, signup off, anonymous comments off.</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-slate-600 dark:text-slate-400">Settings could not be loaded.</div>
      )}
    </div>
  );
}
