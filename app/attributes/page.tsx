'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  api,
  type Category,
  type CategoriesListResponse,
  type CategoryAttribute,
  type AttributeOption,
  type CreateCategoryAttributeBody,
  type UpdateCategoryAttributeBody,
  type CreateAttributeOptionBody,
  type UpdateAttributeOptionBody,
} from '@/lib/api';
import {
  normalizeCreateAttribute,
  normalizeUpdateAttribute,
  normalizeCreateOption,
  normalizeUpdateOption,
} from '@/lib/payload';
import { Protected } from '@/components/Protected';
import { AdminLayout } from '@/components/AdminLayout';
import { AttributeForm } from '@/components/AttributeForm';
import { OptionForm } from '@/components/OptionForm';

const SELECT_TYPES = ['SELECT', 'MULTISELECT'];
export default function AttributesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [attributes, setAttributes] = useState<CategoryAttribute[] | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [error, setError] = useState('');
  const [modalAttribute, setModalAttribute] = useState<'create' | 'edit' | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
  const [deletingAttributeId, setDeletingAttributeId] = useState<number | null>(null);
  const [expandedAttributeId, setExpandedAttributeId] = useState<number | null>(null);
  const [modalOption, setModalOption] = useState<'create' | 'edit' | null>(null);
  const [optionAttributeId, setOptionAttributeId] = useState<number | null>(null);
  const [editingOption, setEditingOption] = useState<AttributeOption | null>(null);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryId === '') {
      setAttributes(null);
      setExpandedAttributeId(null);
      return;
    }
    fetchAttributes();
  }, [categoryId]);

  async function fetchCategories() {
    setLoadingCategories(true);
    setError('');
    try {
      const { data } = await api.get<CategoriesListResponse>('/admin/categories');
      setCategories(data.items);
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
      setLoadingCategories(false);
    }
  }

  async function fetchAttributes() {
    if (categoryId === '') return;
    setLoadingAttributes(true);
    setError('');
    try {
      const { data } = await api.get<CategoryAttribute[] | { items: CategoryAttribute[] }>(
        `/admin/categories/${categoryId}/attributes`
      );
      const list = Array.isArray(data) ? data : (data && 'items' in data ? data.items : []);
      setAttributes(list);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? `/admin/categories/${categoryId}/attributes`,
        status: error.response?.status,
        data: error.response?.data,
        payload: undefined,
      });
      setError('No se pudieron cargar los atributos.');
      setAttributes(null);
    } finally {
      setLoadingAttributes(false);
    }
  }

  async function handleCreateAttribute(body: CreateCategoryAttributeBody | UpdateCategoryAttributeBody) {
    if (categoryId === '') return;
    const url = `/admin/categories/${categoryId}/attributes`;
    const payload = normalizeCreateAttribute(body as Record<string, unknown>);
    try {
      await api.post(url, payload);
      setModalAttribute(null);
      fetchAttributes();
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

  async function handleUpdateAttribute(body: CreateCategoryAttributeBody | UpdateCategoryAttributeBody) {
    if (!editingAttribute) return;
    const url = `/admin/attributes/${editingAttribute.id}`;
    const payload = normalizeUpdateAttribute(body as Record<string, unknown>);
    try {
      await api.patch(url, payload);
      setModalAttribute(null);
      setEditingAttribute(null);
      fetchAttributes();
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

  async function handleDeleteAttribute(id: number) {
    if (!window.confirm('¿Eliminar este atributo?')) return;
    setDeletingAttributeId(id);
    const url = `/admin/attributes/${id}`;
    try {
      await api.delete(url);
      fetchAttributes();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        data: error.response?.data,
        payload: undefined,
      });
      setError('No se pudo eliminar el atributo.');
    } finally {
      setDeletingAttributeId(null);
    }
  }



  async function handleCreateOption(
    body: CreateAttributeOptionBody | UpdateAttributeOptionBody
  ) {
    if (optionAttributeId === null) {
      console.warn('handleCreateOption: optionAttributeId is null');
      return;
    }
    const url = `/admin/attributes/${optionAttributeId}/options`;
    const payload = normalizeCreateOption(body as Record<string, unknown>);
    try {
      await api.post(url, payload);
      setModalOption(null);
      setOptionAttributeId(null);
      fetchAttributes();
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

  async function handleUpdateOption(body: CreateAttributeOptionBody | UpdateAttributeOptionBody) {
    if (!editingOption) return;
    const attrId = attributes?.find((a) =>
      a.options?.some((o) => o.id === editingOption.id)
    )?.id;
    if (attrId == null) return;
    const url = `/admin/attributes/${attrId}/options/${editingOption.id}`;
    const payload = normalizeUpdateOption(body as Record<string, unknown>);
    try {
      await api.patch(url, payload);
      setModalOption(null);
      setEditingOption(null);
      fetchAttributes();
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

  async function handleDeleteOption(attributeId: number, optionId: number) {
    if (!window.confirm('¿Eliminar esta opción?')) return;
    setDeletingOptionId(optionId);
    const url = `/admin/attributes/${attributeId}/options/${optionId}`;
    try {
      await api.delete(url);
      fetchAttributes();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; config?: { url?: string } };
      console.error('Request failed', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        data: error.response?.data,
        payload: undefined,
      });
      setError('No se pudo eliminar la opción.');
    } finally {
      setDeletingOptionId(null);
    }
  }

  function openEditAttribute(attr: CategoryAttribute) {
    setEditingAttribute(attr);
    setModalAttribute('edit');
  }

  function openCreateOption(attrId: number) {
    setOptionAttributeId(attrId);
    setEditingOption(null);
    setModalOption('create');
  }

  function openEditOption(opt: AttributeOption) {
    setEditingOption(opt);
    setOptionAttributeId(null);
    setModalOption('edit');
  }

  const inputClass =
    'rounded border border-black/30 bg-white px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
  const btnPrimary =
    'rounded border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50 inline-flex items-center gap-2';
  const btnSecondary =
    'rounded border border-black/30 bg-white px-3 py-1.5 text-sm text-black hover:bg-black/10 inline-flex items-center gap-1.5';

  return (
    <Protected>
      <AdminLayout>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black border-b border-black/20 pb-2">
            Atributos
          </h1>
        </div>

        <div className="mb-4">
          <label htmlFor="attr-category" className="mb-1 block text-sm font-medium text-black">
            Categoría
          </label>
          <select
            id="attr-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
            disabled={loadingCategories}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-4 text-sm text-black/80" role="alert">
            {error}
          </p>
        )}

        {categoryId === '' ? (
          <p className="text-black/60">Elige una categoría para ver y gestionar sus atributos.</p>
        ) : loadingAttributes ? (
          <p className="text-black/70">Cargando atributos…</p>
        ) : attributes ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black/80">Atributos de la categoría</span>
              <button
                type="button"
                onClick={() => setModalAttribute('create')}
                className={btnPrimary}
              >
                <Plus className="h-4 w-4" />
                Crear atributo
              </button>
            </div>
            <div className="overflow-hidden rounded border border-black/20 bg-white">
              <table className="min-w-full divide-y divide-black/20">
                <thead>
                  <tr className="bg-black/5">
                    <th className="w-8 px-2 py-3" aria-label="Expandir" />
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                      Requerido
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-black/80">
                      Orden
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-black/80">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  {attributes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-black/60">
                        No hay atributos. Crea uno para empezar.
                      </td>
                    </tr>
                  ) : (
                    attributes.map((attr) => (
                      <React.Fragment key={attr.id}>
                        <tr className="bg-white hover:bg-black/5">
                          <td className="px-2 py-2">
                            {SELECT_TYPES.includes(attr.type) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedAttributeId((id) =>
                                    id === attr.id ? null : attr.id
                                  )
                                }
                                className="rounded p-1 text-black hover:bg-black/10"
                                aria-label={expandedAttributeId === attr.id ? 'Ocultar opciones' : 'Ver opciones'}
                              >
                                {expandedAttributeId === attr.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="inline-block w-6" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-black">
                            {(attr as { name?: string; label?: string }).name ??
                              (attr as { name?: string; label?: string }).label ??
                              '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-black/80">{attr.type}</td>
                          <td className="px-4 py-3 text-sm text-black/80">
                            {attr.isRequired ? 'Sí' : 'No'}
                          </td>
                          <td className="px-4 py-3 text-sm text-black/80">
                            {attr.displayOrder ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => openEditAttribute(attr)}
                              className={`mr-2 ${btnSecondary}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttribute(attr.id)}
                              disabled={deletingAttributeId === attr.id}
                              className="text-sm text-black/80 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingAttributeId === attr.id ? '…' : 'Borrar'}
                            </button>
                          </td>
                        </tr>
                        {SELECT_TYPES.includes(attr.type) &&
                          expandedAttributeId === attr.id && (
                            <tr key={`${attr.id}-options`}>
                              <td colSpan={6} className="bg-black/5 px-4 py-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <p className="mb-2 text-xs font-medium uppercase text-black/60">
                                      Opciones
                                    </p>
                                    {attr.options && attr.options.length > 0 ? (
                                      <ul className="space-y-1">
                                        {[...attr.options]
                                          .sort(
                                            (a, b) =>
                                              (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                                          )
                                          .map((opt) => (
                                            <li
                                              key={opt.id}
                                              className="flex items-center justify-between rounded border border-black/10 bg-white px-3 py-2 text-sm text-black"
                                            >
                                              <span>
                                                {opt.value ??
                                                  (opt as { label?: string }).label ??
                                                  '—'}
                                              </span>
                                              <span className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => openEditOption(opt)}
                                                  className={btnSecondary}
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                  Editar
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeleteOption(attr.id, opt.id)
                                                  }
                                                  disabled={deletingOptionId === opt.id}
                                                  className="text-black/80 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                  {deletingOptionId === opt.id ? '…' : 'Borrar'}
                                                </button>
                                              </span>
                                            </li>
                                          ))}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-black/60">
                                        No hay opciones. Añade una para SELECT/MULTISELECT.
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openCreateOption(attr.id)}
                                    className={btnSecondary}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Añadir opción
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </AdminLayout>

      {modalAttribute === 'create' && categoryId !== '' && (
        <AttributeForm
          onClose={() => setModalAttribute(null)}
          onSubmit={handleCreateAttribute}
          submitLabel="Crear"
        />
      )}
      {modalAttribute === 'edit' && editingAttribute && (
        <AttributeForm
          initial={{
            name:
              (editingAttribute as { name?: string }).name ??
              (editingAttribute as { label?: string }).label ??
              '',
            type: editingAttribute.type,
            isRequired: editingAttribute.isRequired,
            displayOrder: editingAttribute.displayOrder ?? 0,
            description: editingAttribute.description ?? undefined,
            isFilterable: editingAttribute.isFilterable ?? false,
            isSearchable: editingAttribute.isSearchable ?? false,
            unit: editingAttribute.unit ?? undefined,
            group: editingAttribute.group ?? undefined,
            minValue: editingAttribute.minValue ?? undefined,
            maxValue: editingAttribute.maxValue ?? undefined,
          }}
          onClose={() => {
            setModalAttribute(null);
            setEditingAttribute(null);
          }}
          onSubmit={handleUpdateAttribute}
          submitLabel="Guardar"
        />
      )}

      {modalOption === 'create' && optionAttributeId !== null && (
        <OptionForm
          onClose={() => {
            setModalOption(null);
            setOptionAttributeId(null);
          }}
          onSubmit={handleCreateOption}
          submitLabel="Crear"
        />
      )}
      {modalOption === 'edit' && editingOption && (
        <OptionForm
          initial={{
            label: editingOption.label ?? editingOption.value ?? '',
            value: editingOption.value ?? editingOption.label ?? '',
            displayOrder: editingOption.displayOrder ?? 0,
          }}
          onClose={() => {
            setModalOption(null);
            setEditingOption(null);
          }}
          onSubmit={handleUpdateOption}
          submitLabel="Guardar"
        />
      )}
    </Protected>
  );
}
