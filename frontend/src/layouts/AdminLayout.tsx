import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
