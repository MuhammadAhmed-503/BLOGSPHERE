import { getAdminSession } from '@/lib/admin-session';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SessionTimeout from '@/components/SessionTimeout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lightweight JWT decode — avoids importing bcrypt/mongoose/User model
  const user = await getAdminSession();

  // Not logged in — must be the login page (middleware protects everything else)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SessionTimeout />
      <AdminSidebar user={{ name: user.name, email: user.email }} />
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
