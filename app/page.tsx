'use client';

import { Protected } from '@/components/Protected';
import { AdminLayout } from '@/components/AdminLayout';

export default function DashboardPage() {
  return (
    <Protected>
      <AdminLayout>
        <h1 className="text-xl font-semibold text-black border-b border-black/20 pb-2 mb-4">
          Dashboard
        </h1>
        <p className="text-black/80">
          Panel de administración. Usa el menú lateral para navegar a Categorías o Atributos.
        </p>
      </AdminLayout>
    </Protected>
  );
}
