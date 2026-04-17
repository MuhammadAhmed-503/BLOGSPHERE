const toneClasses = {
    blue: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    purple: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
};
export default function AdminStatCard({ title, value, icon: Icon, tone = 'blue', detail }) {
    return (<div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          {detail && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{detail}</p>}
        </div>
        <div className={`inline-flex rounded-2xl p-3 ${toneClasses[tone]}`}>
          <Icon className="h-6 w-6"/>
        </div>
      </div>
    </div>);
}
