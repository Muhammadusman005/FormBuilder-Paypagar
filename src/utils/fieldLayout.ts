/**
 * fieldLayout.ts
 *
 * Pure utility functions for form field row/grid layout operations.
 * Used by FormCanvas (drag-drop) and Builder (palette drop into row).
 * No React dependency — plain TypeScript.
 */

import type { FormField } from '../types/form';

// ── Row renumbering ────────────────────────────────────────────────────────

/**
 * Renumbers row indices to be sequential (0, 1, 2, …) after any mutation.
 * Preserves relative order of rows.
 */
export function renumberRows(fields: FormField[]): FormField[] {
  const usedRows = Array.from(new Set(fields.map(f => f.row ?? 0))).sort((a, b) => a - b);
  const rowMap   = new Map<number, number>();
  usedRows.forEach((r, i) => rowMap.set(r, i));
  return fields.map(f => ({ ...f, row: rowMap.get(f.row ?? 0) ?? 0 }));
}

// ── ColSpan helpers ────────────────────────────────────────────────────────

/**
 * Returns the equal colSpan each field should get when `count` fields share a row.
 * Always returns 1 | 2 | 3 | 4.
 */
export function equalColSpan(count: number): 1 | 2 | 3 | 4 {
  return Math.max(1, Math.floor(4 / count)) as 1 | 2 | 3 | 4;
}

// ── Next row index ─────────────────────────────────────────────────────────

/**
 * Returns the next available row index (max existing row + 1).
 */
export function nextRowIndex(fields: FormField[]): number {
  return fields.reduce((max, f) => Math.max(max, f.row ?? 0), -1) + 1;
}

// ── Drag-drop operations ───────────────────────────────────────────────────

/**
 * Merges a field (by sourceId) into a target row at a given slot position.
 *
 * - If source and target are the same row → reorders within the row.
 * - If different rows → moves source into target row, redistributes colSpans.
 */
export function mergeFieldIntoRow(
  fields:       FormField[],
  sourceId:     string,
  targetRowKey: number,
  slotIndex:    number,
): FormField[] {
  const sourceField     = fields.find(f => f.id === sourceId);
  if (!sourceField) return fields;

  const sourceRow       = sourceField.row ?? 0;
  const targetRowFields = fields.filter(f => (f.row ?? 0) === targetRowKey);

  if (sourceRow === targetRowKey) {
    // ── Reorder within same row ──────────────────────────────────
    const ids     = targetRowFields.map(f => f.id);
    const fromIdx = ids.indexOf(sourceId);
    if (fromIdx === -1) return fields;

    const newIds   = [...ids];
    newIds.splice(fromIdx, 1);
    const insertAt = slotIndex > fromIdx ? slotIndex - 1 : slotIndex;
    newIds.splice(Math.min(insertAt, newIds.length), 0, sourceId);

    const idMap  = new Map(targetRowFields.map(f => [f.id, f]));
    const nonRow = fields.filter(f => (f.row ?? 0) !== targetRowKey);
    return renumberRows([...nonRow, ...newIds.map(id => idMap.get(id)!)]);
  }

  // ── Move from different row into target row ──────────────────
  const newColSpan = equalColSpan(targetRowFields.length + 1);

  let updated = fields.map(f => {
    if (f.id === sourceId)             return { ...f, row: targetRowKey, colSpan: newColSpan };
    if ((f.row ?? 0) === targetRowKey) return { ...f, colSpan: newColSpan };
    return f;
  });

  // Redistribute siblings left behind in source row
  const siblings = fields.filter(f => (f.row ?? 0) === sourceRow && f.id !== sourceId);
  if (siblings.length > 0) {
    const sibColSpan = equalColSpan(siblings.length);
    updated = updated.map(f =>
      f.id !== sourceId && (f.row ?? 0) === sourceRow ? { ...f, colSpan: sibColSpan } : f
    );
  }

  return renumberRows(updated);
}

/**
 * Moves a field (by sourceId) to a brand-new row inserted after `afterRowKey`.
 * Redistributes colSpans for siblings left behind.
 */
export function moveFieldToNewRow(
  fields:      FormField[],
  sourceId:    string,
  afterRowKey: number,
): FormField[] {
  const sourceField     = fields.find(f => f.id === sourceId);
  if (!sourceField) return fields;

  const sourceRow       = sourceField.row ?? 0;
  const sourceRowFields = fields.filter(f => (f.row ?? 0) === sourceRow);
  const newRowIndex     = afterRowKey + 1;

  // Shift rows >= newRowIndex up by 1 (except source)
  let updated = fields.map(f => {
    if (f.id === sourceId) return f;
    const r = f.row ?? 0;
    return r >= newRowIndex ? { ...f, row: r + 1 } : f;
  });

  // Place source at newRowIndex, full width
  updated = updated.map(f =>
    f.id === sourceId ? { ...f, row: newRowIndex, colSpan: 4 as const } : f
  );

  // Redistribute siblings left behind
  if (sourceRowFields.length > 1) {
    const siblings   = sourceRowFields.filter(f => f.id !== sourceId);
    const sibColSpan = equalColSpan(siblings.length);
    updated = updated.map(f =>
      f.id !== sourceId && (f.row ?? 0) === sourceRow ? { ...f, colSpan: sibColSpan } : f
    );
  }

  return renumberRows(updated);
}

/**
 * Inserts a new field into an existing row at `slotIndex`, redistributing colSpans.
 * Used when dropping a palette item into an existing row.
 */
export function insertFieldIntoRow(
  fields:      FormField[],
  newField:    FormField,
  targetRow:   number,
  slotIndex:   number,
): FormField[] {
  const targetRowFields = fields.filter(f => (f.row ?? 0) === targetRow);
  const newColSpan      = equalColSpan(targetRowFields.length + 1);

  // Redistribute existing fields in that row
  const updatedExisting = fields.map(f =>
    (f.row ?? 0) === targetRow ? { ...f, colSpan: newColSpan } : f
  );

  // Build ordered list for the target row and splice new field in
  const rowFieldsOrdered = updatedExisting
    .filter(f => (f.row ?? 0) === targetRow)
    .sort((a, b) => fields.findIndex(x => x.id === a.id) - fields.findIndex(x => x.id === b.id));

  rowFieldsOrdered.splice(slotIndex, 0, { ...newField, row: targetRow, colSpan: newColSpan });

  const nonRowFields = updatedExisting.filter(f => (f.row ?? 0) !== targetRow);
  return renumberRows([...nonRowFields, ...rowFieldsOrdered]);
}

/**
 * Inserts a new field as a brand-new row after `afterRowKey`.
 * Shifts all rows >= newRowIndex up by 1.
 */
export function insertFieldAsNewRow(
  fields:      FormField[],
  newField:    FormField,
  afterRowKey: number,
): FormField[] {
  const newRowIndex = afterRowKey + 1;

  const shifted = fields.map(f => {
    const r = f.row ?? 0;
    return r >= newRowIndex ? { ...f, row: r + 1 } : f;
  });

  return renumberRows([...shifted, { ...newField, row: newRowIndex, colSpan: 4 as const }]);
}
