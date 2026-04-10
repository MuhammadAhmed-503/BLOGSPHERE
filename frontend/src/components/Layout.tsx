import Footer from './Footer';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Layout({ children, theme, onToggleTheme }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation theme={theme} onToggleTheme={onToggleTheme} />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
