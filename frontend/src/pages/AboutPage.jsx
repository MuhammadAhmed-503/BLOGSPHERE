import { Code, Rocket, Shield, Users } from 'lucide-react';
const features = [
    {
        icon: <Rocket className="h-8 w-8"/>,
        title: 'Fast Static Delivery',
        description: 'Built as a client-rendered React app that can ship from a simple static host.',
    },
    {
        icon: <Shield className="h-8 w-8"/>,
        title: 'Simple Deployment',
        description: 'No Next.js runtime is required, which makes deployment lighter and more predictable.',
    },
    {
        icon: <Code className="h-8 w-8"/>,
        title: 'Modern Stack',
        description: 'React, TypeScript, Tailwind CSS, and Vite for a lean build pipeline.',
    },
    {
        icon: <Users className="h-8 w-8"/>,
        title: 'Content Focused',
        description: 'Designed around reading, discovery, and newsletter conversion.',
    },
];
const technologies = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'Zod', 'Marked'];
export default function AboutPage() {
    return (<div className="min-h-screen py-16">
      <div className="mx-auto mb-16 max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
          About Our Platform
        </h1>
        <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400">
          This version keeps the public experience and removes the Next.js server dependency so the site can be deployed as a static React app.
        </p>
      </div>

      <div className="mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">Built for the browser</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (<div key={feature.title} className="card p-6 text-center transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-primary-100 p-4 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>))}
        </div>
      </div>

      <div className="mx-auto mb-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">Technology Stack</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            The React rewrite uses a smaller toolchain while keeping the visual direction of the original blog.
          </p>
          <div className="flex flex-wrap gap-3">
            {technologies.map((technology) => (<span key={technology} className="rounded-full bg-primary-100 px-4 py-2 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                {technology}
              </span>))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">Core Features</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {['Dark Mode Support', 'Search & Filtering', 'Newsletter Signup', 'Responsive Layout', 'Related Posts', 'Social Sharing'].map((feature) => (<div key={feature} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="h-2 w-2 rounded-full bg-primary-600"/>
                <span>{feature}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
