'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderTree, Tags, LogOut } from 'lucide-react';
import { removeToken } from '@/lib/auth';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/attributes', label: 'Attributes', icon: Tags },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      <aside className="w-56 border-r border-black/20 flex flex-col">
        <div className="p-4 border-b border-black/20">
          <span className="font-semibold text-black">Admin</span>
        </div>
        <nav className="flex-1 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded border border-transparent text-black hover:bg-black/10 hover:border-black/20 ${
                  isActive ? 'bg-black/10 border-black/20' : ''
                }`}
              >
                <Icon className="h-5 w-5 text-black" strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-black/20 flex items-center justify-end px-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded border border-black/30 text-black hover:bg-black/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Logout
          </button>
        </header>
        <main className="flex-1 p-6 text-black">{children}</main>
      </div>
    </div>
  );
}
