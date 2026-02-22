'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CreateAttributeOptionBody, UpdateAttributeOptionBody } from '@/lib/api';

interface OptionFormProps {
  initial?: { label?: string; value?: string; displayOrder?: number };
  onClose: () => void;
  onSubmit: (body: CreateAttributeOptionBody | UpdateAttributeOptionBody) => Promise<void>;
  submitLabel: string;
}

const inputClass =
  'w-full rounded border border-black/30 bg-white px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
const labelClass = 'mb-1 block text-sm font-medium text-black';

export function OptionForm({
  initial,
  onClose,
  onSubmit,
  submitLabel,
}: OptionFormProps) {
  const [label, setLabel] = useState(initial?.label ?? initial?.value ?? '');
  const [value, setValue] = useState(initial?.value ?? initial?.label ?? '');
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setLabel(initial.label ?? initial.value ?? '');
      setValue(initial.value ?? initial.label ?? '');
      setDisplayOrder(initial.displayOrder ?? 0);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: CreateAttributeOptionBody = {
        label: label.trim(),
        value: value.trim(),
        ...(displayOrder !== undefined && displayOrder !== 0
          ? { displayOrder: Number(displayOrder) }
          : {}),
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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded border border-black/20 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">
            {initial ? 'Editar opción' : 'Nueva opción'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-black hover:bg-black/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="opt-label" className={labelClass}>
              Etiqueta
            </label>
            <input
              id="opt-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={100}
              className={inputClass}
              placeholder="Etiqueta (ej. Pequeño)"
            />
          </div>
          <div>
            <label htmlFor="opt-value" className={labelClass}>
              Valor
            </label>
            <input
              id="opt-value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              maxLength={100}
              className={inputClass}
              placeholder="Valor (ej. small)"
            />
          </div>
          <div>
            <label htmlFor="opt-displayOrder" className={labelClass}>
              Orden de visualización
            </label>
            <input
              id="opt-displayOrder"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
              className={inputClass}
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
