import { Menu, Moon, Sun } from 'lucide-react';
export default function AdminTopbar({ onToggleSidebar, theme, onToggleTheme }) {
    return (<div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onToggleSidebar} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Open sidebar">
          <Menu className="h-5 w-5"/>
        </button>

        <button type="button" onClick={onToggleTheme} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400"/> : <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200"/>}
        </button>
      </div>
    </div>);
}
