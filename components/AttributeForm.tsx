'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  CreateCategoryAttributeBody,
  UpdateCategoryAttributeBody,
} from '@/lib/api';

const ATTRIBUTE_TYPES = [
  'TEXT',
  'NUMBER',
  'SELECT',
  'MULTISELECT',
  'BOOLEAN',
] as const;

interface AttributeFormInitial {
  name: string;
  type: string;
  isRequired: boolean;
  displayOrder: number;
  description?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string;
  group?: string;
  minValue?: number;
  maxValue?: number;
}

interface AttributeFormProps {
  initial?: AttributeFormInitial;
  onClose: () => void;
  onSubmit: (body: CreateCategoryAttributeBody | UpdateCategoryAttributeBody) => Promise<void>;
  submitLabel: string;
}

const inputClass =
  'w-full rounded border border-black/30 bg-white px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
const labelClass = 'mb-1 block text-sm font-medium text-black';

export function AttributeForm({
  initial,
  onClose,
  onSubmit,
  submitLabel,
}: AttributeFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.type ?? 'TEXT');
  const [isRequired, setIsRequired] = useState(initial?.isRequired ?? false);
  const [displayOrder, setDisplayOrder] = useState(
    initial?.displayOrder ?? 0
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isFilterable, setIsFilterable] = useState(initial?.isFilterable ?? false);
  const [isSearchable, setIsSearchable] = useState(initial?.isSearchable ?? false);
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [group, setGroup] = useState(initial?.group ?? '');
  const [minValue, setMinValue] = useState<string>(
    initial?.minValue !== undefined && initial?.minValue !== null
      ? String(initial.minValue)
      : ''
  );
  const [maxValue, setMaxValue] = useState<string>(
    initial?.maxValue !== undefined && initial?.maxValue !== null
      ? String(initial.maxValue)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setIsRequired(initial.isRequired ?? false);
      setDisplayOrder(initial.displayOrder);
      setDescription(initial.description ?? '');
      setIsFilterable(initial.isFilterable ?? false);
      setIsSearchable(initial.isSearchable ?? false);
      setUnit(initial.unit ?? '');
      setGroup(initial.group ?? '');
      setMinValue(
        initial.minValue !== undefined && initial.minValue !== null
          ? String(initial.minValue)
          : ''
      );
      setMaxValue(
        initial.maxValue !== undefined && initial.maxValue !== null
          ? String(initial.maxValue)
          : ''
      );
    }
  }, [initial]);

  function handleTypeChange(newType: string) {
    setType(newType);
    if (newType !== 'NUMBER') {
      setMinValue('');
      setMaxValue('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: CreateCategoryAttributeBody | UpdateCategoryAttributeBody = {
        name: name.trim(),
        type,
        isRequired,
        displayOrder: Number(displayOrder) || 0,
        description: description.trim() || undefined,
        isFilterable,
        isSearchable,
        unit: unit.trim() || undefined,
        group: group.trim() || undefined,
      };
      if (type === 'NUMBER') {
        const min = minValue.trim() === '' ? undefined : Number(minValue);
        const max = maxValue.trim() === '' ? undefined : Number(maxValue);
        if (min !== undefined && !Number.isNaN(min)) body.minValue = min;
        if (max !== undefined && !Number.isNaN(max)) body.maxValue = max;
      }
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
      <div className="w-full max-w-md rounded border border-black/20 bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">
            {initial ? 'Editar atributo' : 'Nuevo atributo'}
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
            <label htmlFor="attr-name" className={labelClass}>
              Nombre
            </label>
            <input
              id="attr-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className={inputClass}
              placeholder="Nombre del atributo"
            />
          </div>
          <div>
            <label htmlFor="attr-type" className={labelClass}>
              Tipo
            </label>
            <select
              id="attr-type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={inputClass}
            >
              {ATTRIBUTE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="attr-description" className={labelClass}>
              Descripción
            </label>
            <textarea
              id="attr-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Descripción opcional"
            />
          </div>
          <div>
            <label htmlFor="attr-unit" className={labelClass}>
              Unidad
            </label>
            <input
              id="attr-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={inputClass}
              placeholder="ej. km, años, kg"
            />
          </div>
          <div>
            <label htmlFor="attr-group" className={labelClass}>
              Grupo
            </label>
            <input
              id="attr-group"
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className={inputClass}
              placeholder="Agrupar atributos"
            />
          </div>
          {type === 'NUMBER' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="attr-minValue" className={labelClass}>
                  Valor mínimo
                </label>
                <input
                  id="attr-minValue"
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </div>
              <div>
                <label htmlFor="attr-maxValue" className={labelClass}>
                  Valor máximo
                </label>
                <input
                  id="attr-maxValue"
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="attr-displayOrder" className={labelClass}>
              Orden de visualización
            </label>
            <input
              id="attr-displayOrder"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="attr-required"
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-4 w-4 rounded border-black/30 text-black focus:ring-black"
              />
              <label htmlFor="attr-required" className="text-sm font-medium text-black">
                Requerido
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="attr-filterable"
                type="checkbox"
                checked={isFilterable}
                onChange={(e) => setIsFilterable(e.target.checked)}
                className="h-4 w-4 rounded border-black/30 text-black focus:ring-black"
              />
              <label htmlFor="attr-filterable" className="text-sm font-medium text-black">
                Usar como filtro
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="attr-searchable"
                type="checkbox"
                checked={isSearchable}
                onChange={(e) => setIsSearchable(e.target.checked)}
                className="h-4 w-4 rounded border-black/30 text-black focus:ring-black"
              />
              <label htmlFor="attr-searchable" className="text-sm font-medium text-black">
                Buscable
              </label>
            </div>
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
