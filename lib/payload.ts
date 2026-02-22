/**
 * Payload normalizers for admin API requests.
 * Backend uses ValidationPipe with whitelist + forbidNonWhitelisted;
 * only these allowed fields must be sent. Never send id, slug, createdAt, updatedAt, categoryId.
 */

// --- Categories ---

/** POST /admin/categories — only name, description? */
export function normalizeCreateCategory(body: Record<string, unknown>): {
  name: string;
  description?: string;
} {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description =
    typeof body.description === 'string' && body.description.trim() !== ''
      ? body.description.trim()
      : undefined;
  const out: { name: string; description?: string } = { name };
  if (description !== undefined) out.description = description;
  return out;
}

/** PATCH /admin/categories/:id — only name?, description? (no slug, timestamps) */
export function normalizeUpdateCategory(body: Record<string, unknown>): {
  name?: string;
  description?: string;
} {
  const out: { name?: string; description?: string } = {};
  if (typeof body.name === 'string') out.name = body.name.trim();
  if (typeof body.description === 'string') out.description = body.description.trim();
  return out;
}

// --- Attributes ---

type AttributeCreateOut = {
  name: string;
  type: string;
  isRequired?: boolean;
  displayOrder?: number;
  description?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string;
  group?: string;
  minValue?: number;
  maxValue?: number;
};

function strOrUndefined(val: unknown): string | undefined {
  if (typeof val !== 'string') return undefined;
  const t = val.trim();
  return t === '' ? undefined : t;
}

function numOrUndefined(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}

/** POST /admin/categories/:categoryId/attributes */
export function normalizeCreateAttribute(body: Record<string, unknown>): AttributeCreateOut {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const type = typeof body.type === 'string' ? body.type : 'TEXT';
  const isRequired =
    body.isRequired !== undefined
      ? Boolean(body.isRequired)
      : body.required !== undefined
        ? Boolean(body.required)
        : undefined;
  const displayOrder = numOrUndefined(body.displayOrder);
  const description = strOrUndefined(body.description);
  const isFilterable =
    body.isFilterable !== undefined ? Boolean(body.isFilterable) : undefined;
  const isSearchable =
    body.isSearchable !== undefined ? Boolean(body.isSearchable) : undefined;
  const unit = strOrUndefined(body.unit);
  const group = strOrUndefined(body.group);

  const out: AttributeCreateOut = { name, type };
  if (isRequired !== undefined) out.isRequired = isRequired;
  if (displayOrder !== undefined) out.displayOrder = displayOrder;
  if (description !== undefined) out.description = description;
  if (isFilterable !== undefined) out.isFilterable = isFilterable;
  if (isSearchable !== undefined) out.isSearchable = isSearchable;
  if (unit !== undefined) out.unit = unit;
  if (group !== undefined) out.group = group;

  if (type === 'NUMBER') {
    const minValue = numOrUndefined(body.minValue);
    const maxValue = numOrUndefined(body.maxValue);
    if (minValue !== undefined) out.minValue = minValue;
    if (maxValue !== undefined) out.maxValue = maxValue;
  }
  return out;
}

type AttributeUpdateOut = {
  name?: string;
  type?: string;
  isRequired?: boolean;
  displayOrder?: number;
  description?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string;
  group?: string;
  minValue?: number;
  maxValue?: number;
};

/** PATCH /admin/attributes/:attributeId */
export function normalizeUpdateAttribute(body: Record<string, unknown>): AttributeUpdateOut {
  const out: AttributeUpdateOut = {};
  if (typeof body.name === 'string') out.name = body.name.trim();
  if (typeof body.type === 'string') out.type = body.type;
  const isRequired =
    body.isRequired !== undefined
      ? Boolean(body.isRequired)
      : body.required !== undefined
        ? Boolean(body.required)
        : undefined;
  if (isRequired !== undefined) out.isRequired = isRequired;
  const displayOrder = numOrUndefined(body.displayOrder);
  if (displayOrder !== undefined) out.displayOrder = displayOrder;

  const description = strOrUndefined(body.description);
  if (description !== undefined) out.description = description;
  const isFilterable =
    body.isFilterable !== undefined ? Boolean(body.isFilterable) : undefined;
  if (isFilterable !== undefined) out.isFilterable = isFilterable;
  const isSearchable =
    body.isSearchable !== undefined ? Boolean(body.isSearchable) : undefined;
  if (isSearchable !== undefined) out.isSearchable = isSearchable;
  const unit = strOrUndefined(body.unit);
  if (unit !== undefined) out.unit = unit;
  const group = strOrUndefined(body.group);
  if (group !== undefined) out.group = group;

  if (body.type === 'NUMBER') {
    const minValue = numOrUndefined(body.minValue);
    const maxValue = numOrUndefined(body.maxValue);
    if (minValue !== undefined) out.minValue = minValue;
    if (maxValue !== undefined) out.maxValue = maxValue;
  }
  return out;
}

// --- Options ---

/** POST /admin/attributes/:attributeId/options — label + value required */
export function normalizeCreateOption(body: Record<string, unknown>): {
  label: string;
  value: string;
  displayOrder?: number;
} {
  const label =
    typeof body.label === 'string'
      ? body.label.trim()
      : typeof body.value === 'string'
        ? body.value.trim()
        : '';
  const value =
    typeof body.value === 'string'
      ? body.value.trim()
      : typeof body.label === 'string'
        ? body.label.trim()
        : '';
  const displayOrder =
    body.displayOrder !== undefined && body.displayOrder !== null && body.displayOrder !== ''
      ? Number(body.displayOrder)
      : undefined;

  const out: { label: string; value: string; displayOrder?: number } = { label, value };
  if (displayOrder !== undefined && !Number.isNaN(displayOrder)) out.displayOrder = displayOrder;
  return out;
}

/** PATCH /admin/attributes/:attributeId/options/:optionId */
export function normalizeUpdateOption(body: Record<string, unknown>): {
  label?: string;
  value?: string;
  displayOrder?: number;
} {
  const out: { label?: string; value?: string; displayOrder?: number } = {};
  if (typeof body.label === 'string') out.label = body.label.trim();
  if (typeof body.value === 'string') out.value = body.value.trim();
  const displayOrder =
    body.displayOrder !== undefined && body.displayOrder !== null && body.displayOrder !== ''
      ? Number(body.displayOrder)
      : undefined;
  if (displayOrder !== undefined && !Number.isNaN(displayOrder)) out.displayOrder = displayOrder;
  return out;
}
