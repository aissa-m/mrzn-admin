'use client';

import { useState, useEffect } from 'react';
import type { CreateCategoryBody, UpdateCategoryBody } from '@/lib/api';

interface CategoryFormProps {
  initial?: { name: string; description: string };
  onClose: () => void;
  onSubmit: (body: CreateCategoryBody | UpdateCategoryBody) => Promise<void>;
  submitLabel: string;
}

const inputClass =
  'w-full rounded border border-black/30 bg-white px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
const labelClass = 'mb-1 block text-sm font-medium text-black';

export function CategoryForm({
  initial,
  onClose,
  onSubmit,
  submitLabel,
}: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: CreateCategoryBody = {
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
      };
      await onSubmit(body);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : null;
      setError(
        Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : 'Error al guardar'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded border border-black/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-black">
          {initial ? 'Editar categoría' : 'Nueva categoría'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className={labelClass}>
              Nombre
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className={inputClass}
              placeholder="Nombre de la categoría"
            />
          </div>
          <div>
            <label htmlFor="cat-desc" className={labelClass}>
              Descripción (opcional)
            </label>
            <textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className={inputClass}
              placeholder="Descripción"
            />
          </div>
          {error && (
            <p className="text-sm text-black/80" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-black/30 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
            >
              {loading ? 'Guardando…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
