import Footer from './Footer';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';
export default function Layout({ children, theme, onToggleTheme }) {
    return (<div className="min-h-screen flex flex-col">
      <Navigation theme={theme} onToggleTheme={onToggleTheme}/>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>);
}
