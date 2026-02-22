'use client';

import { useEffect, useState } from 'react';
import {
  api,
  type Category,
  type CategoriesListResponse,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from '@/lib/api';
import { normalizeCreateCategory, normalizeUpdateCategory } from '@/lib/payload';
import { Protected } from '@/components/Protected';
import { AdminLayout } from '@/components/AdminLayout';
import { CategoryForm } from '@/components/CategoryForm';

export default function CategoriesPage() {
  const [data, setData] = useState<CategoriesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get<CategoriesListResponse>('/admin/categories');
      setData(res);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? '/admin/categories',
        status: error.response?.status,
        data: error.response?.data,
        payload: undefined,
      });
      setError('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(body: CreateCategoryBody | UpdateCategoryBody) {
    const url = '/admin/categories';
    const payload = normalizeCreateCategory(body as Record<string, unknown>);
    try {
      await api.post(url, payload);
      setModalOpen(null);
      fetchCategories();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        data: error.response?.data,
        payload,
      });
      throw err;
    }
  }

  async function handleUpdate(body: CreateCategoryBody | UpdateCategoryBody) {
    if (!editingCategory) return;
    const url = `/admin/categories/${editingCategory.id}`;
    const payload = normalizeUpdateCategory(body as Record<string, unknown>);
    try {
      await api.patch(url, payload);
      setModalOpen(null);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        data: error.response?.data,
        payload,
      });
      throw err;
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setDeletingId(id);
    const url = `/admin/categories/${id}`;
    try {
      await api.delete(url);
      fetchCategories();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        data: error.response?.data,
        payload: undefined,
      });
      setError('No se pudo eliminar la categoría.');
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setModalOpen('edit');
  }

  const inputClass =
    'w-full rounded border border-black/30 bg-white px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
  const btnPrimary =
    'rounded border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50';
  const btnSecondary = 'rounded border border-black/30 bg-white px-4 py-2 text-sm text-black hover:bg-black/10';

  return (
    <Protected>
      <AdminLayout>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black border-b border-black/20 pb-2">
            Categorías
          </h1>
          <button type="button" onClick={() => setModalOpen('create')} className={btnPrimary}>
            Crear categoría
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-black/80" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-black/70">Cargando…</p>
        ) : data ? (
          <div className="overflow-hidden rounded border border-black/20 bg-white">
            <table className="min-w-full divide-y divide-black/20">
              <thead>
                <tr className="bg-black/5">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-black/80">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-black/60">
                      No hay categorías. Crea una para empezar.
                    </td>
                  </tr>
                ) : (
                  data.items.map((cat) => (
                    <tr key={cat.id} className="bg-white hover:bg-black/5">
                      <td className="px-4 py-3 text-sm text-black">{cat.name}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-sm text-black/70">
                        {cat.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black/60">{cat.slug}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className={`mr-2 text-sm ${btnSecondary}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          className="text-sm text-black/80 hover:underline disabled:opacity-50"
                        >
                          {deletingId === cat.id ? '…' : 'Borrar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminLayout>

      {modalOpen === 'create' && (
        <CategoryForm
          onClose={() => setModalOpen(null)}
          onSubmit={handleCreate}
          submitLabel="Crear"
        />
      )}
      {modalOpen === 'edit' && editingCategory && (
        <CategoryForm
          initial={{
            name: editingCategory.name,
            description: editingCategory.description ?? '',
          }}
          onClose={() => {
            setModalOpen(null);
            setEditingCategory(null);
          }}
          onSubmit={handleUpdate}
          submitLabel="Guardar"
        />
      )}
    </Protected>
  );
}
