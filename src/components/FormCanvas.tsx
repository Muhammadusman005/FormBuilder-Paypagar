import { useState, useRef } from 'react';
import type { FormField } from '../types/form';
import { FormFieldPreview } from './FormFieldPreview';
import { Layers } from 'lucide-react';
import { GRID_COLUMNS } from '../constants';

interface Props {
  title: string;
  fields: FormField[];
  selectedFieldId: string | null;
  draggedId: string | null;
  onFieldDragStart: (id: string) => void;
  onFieldsUpdate: (fields: FormField[]) => void;
  onDelete: (id: string) => void;
  onSelect: (field: FormField) => void;
  onCanvasDrop: (e: React.DragEvent) => void;
}

type DropZone =
  | { type: 'row'; rowKey: number }           // drop between rows → new row
  | { type: 'merge'; targetFieldId: string }; // drop on a field → merge into same row

export const FormCanvas = ({
  title,
  fields,
  selectedFieldId,
  draggedId,
  onFieldDragStart,
  onFieldsUpdate,
  onDelete,
  onSelect,
  onCanvasDrop,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const dragSourceId = useRef<string | null>(null);

  // Group fields by row
  const groupedRows = fields.reduce<Map<number, FormField[]>>((acc, field) => {
    const rowKey = field.row ?? 0;
    if (!acc.has(rowKey)) acc.set(rowKey, []);
    acc.get(rowKey)!.push(field);
    return acc;
  }, new Map());
  const sortedRows = Array.from(groupedRows.entries()).sort(([a], [b]) => a - b);

  // ── Canvas-level drag (from palette) ──────────────────────────
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Only show canvas-level drop if dragging from palette (no dragSourceId)
    if (!dragSourceId.current) setIsDragOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropZone(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    setDropZone(null);
    dragSourceId.current = null;
    onCanvasDrop(e);
  };

  // ── Field drag start ──────────────────────────────────────────
  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    dragSourceId.current = fieldId;
    e.dataTransfer.effectAllowed = 'move';
    onFieldDragStart(fieldId);
  };

  // ── Drop on a field → merge into same row ─────────────────────
  const handleFieldDragOver = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSourceId.current && dragSourceId.current !== targetFieldId) {
      setDropZone({ type: 'merge', targetFieldId });
    }
  };

  const handleFieldDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropZone(null);

    const sourceId = dragSourceId.current;
    dragSourceId.current = null;
    if (!sourceId || sourceId === targetFieldId) return;

    const sourceField = fields.find(f => f.id === sourceId);
    const targetField = fields.find(f => f.id === targetFieldId);
    if (!sourceField || !targetField) return;

    const sourceRow = sourceField.row ?? 0;
    const targetRow = targetField.row ?? 0;

    if (sourceRow === targetRow) {
      // Same row → reorder within the row
      const updated = [...fields];
      const fromIdx = updated.findIndex(f => f.id === sourceId);
      const toIdx = updated.findIndex(f => f.id === targetFieldId);
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      onFieldsUpdate(updated);
    } else {
      // Different row → merge source into target's row
      // Auto-adjust colSpan so they fit: split 4 columns equally
      const targetRowFields = fields.filter(f => (f.row ?? 0) === targetRow);
      const newCount = targetRowFields.length + 1;
      const newColSpan = Math.max(1, Math.floor(4 / newCount)) as 1 | 2 | 3 | 4;

      const updated = fields.map(f => {
        if (f.id === sourceId) {
          return { ...f, row: targetRow, colSpan: newColSpan };
        }
        if ((f.row ?? 0) === targetRow) {
          return { ...f, colSpan: newColSpan };
        }
        return f;
      });

      // Clean up empty rows — renumber rows to stay sequential
      const usedRows = new Set(updated.map(f => f.row ?? 0));
      const rowMap = new Map<number, number>();
      Array.from(usedRows).sort((a, b) => a - b).forEach((r, i) => rowMap.set(r, i));
      const renumbered = updated.map(f => ({ ...f, row: rowMap.get(f.row ?? 0) ?? 0 }));

      onFieldsUpdate(renumbered);
    }
  };

  // ── Drop between rows → insert as new row ─────────────────────
  const handleRowGapDragOver = (e: React.DragEvent, afterRowKey: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSourceId.current) setDropZone({ type: 'row', rowKey: afterRowKey });
  };

  const handleRowGapDrop = (e: React.DragEvent, afterRowKey: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropZone(null);

    const sourceId = dragSourceId.current;
    dragSourceId.current = null;
    if (!sourceId) return;

    const sourceField = fields.find(f => f.id === sourceId);
    if (!sourceField) return;

    const sourceRow = sourceField.row ?? 0;

    // If source is already a solo field at this position, no-op
    const sourceRowFields = fields.filter(f => (f.row ?? 0) === sourceRow);

    // Insert source as a new row after `afterRowKey`
    // Shift all rows after afterRowKey up by 1, then place source at afterRowKey + 1
    const newRowIndex = afterRowKey + 1;

    let updated = fields.map(f => {
      if (f.id === sourceId) return f; // handle separately
      const r = f.row ?? 0;
      if (r >= newRowIndex) return { ...f, row: r + 1 };
      return f;
    });

    // If source was the only field in its row, remove that row and re-compact
    const wasAlone = sourceRowFields.length === 1;

    updated = updated.map(f => {
      if (f.id === sourceId) {
        return { ...f, row: newRowIndex, colSpan: 4 as const };
      }
      return f;
    });

    // If source left its row alone, restore colSpan of remaining fields in that row
    if (!wasAlone) {
      const oldRowFields = updated.filter(f => f.id !== sourceId && (f.row ?? 0) === sourceRow);
      const newColSpan = Math.max(1, Math.floor(4 / oldRowFields.length)) as 1 | 2 | 3 | 4;
      updated = updated.map(f => {
        if (f.id !== sourceId && (f.row ?? 0) === sourceRow) {
          return { ...f, colSpan: newColSpan };
        }
        return f;
      });
    }

    // Renumber rows sequentially
    const usedRows = new Set(updated.map(f => f.row ?? 0));
    const rowMap = new Map<number, number>();
    Array.from(usedRows).sort((a, b) => a - b).forEach((r, i) => rowMap.set(r, i));
    const renumbered = updated.map(f => ({ ...f, row: rowMap.get(f.row ?? 0) ?? 0 }));

    onFieldsUpdate(renumbered);
  };

  const handleFieldDragEnd = () => {
    dragSourceId.current = null;
    setDropZone(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Canvas</p>

        <div
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          className={`bg-white rounded-xl border-2 border-dashed min-h-[480px] transition-all ${
            isDragOver
              ? 'border-indigo-400 bg-indigo-50/50 shadow-lg shadow-indigo-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Form header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{title || 'Untitled Form'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-4">
            {fields.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-16 transition-all ${isDragOver ? 'scale-105' : ''}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-colors ${isDragOver ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  <Layers className={`w-6 h-6 ${isDragOver ? 'text-indigo-500' : 'text-slate-400'}`} />
                </div>
                <p className={`text-sm font-medium ${isDragOver ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {isDragOver ? 'Drop to add field' : 'Drag components here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Your form fields will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {sortedRows.map(([rowKey, rowFields], rowIndex) => (
                  <div key={rowKey}>
                    {/* ── Gap zone BEFORE this row (except first) ── */}
                    {rowIndex > 0 && (
                      <div
                        onDragOver={(e) => handleRowGapDragOver(e, sortedRows[rowIndex - 1][0])}
                        onDrop={(e) => handleRowGapDrop(e, sortedRows[rowIndex - 1][0])}
                        className={`h-3 mx-1 rounded transition-all my-0.5 ${
                          dropZone?.type === 'row' && dropZone.rowKey === sortedRows[rowIndex - 1][0]
                            ? 'bg-indigo-300 h-6'
                            : 'hover:bg-indigo-100'
                        }`}
                      />
                    )}

                    {/* ── Row of fields ── */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
                        gap: '12px',
                        marginBottom: '0',
                      }}
                    >
                      {rowFields.map((field) => (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => handleFieldDragStart(e, field.id)}
                          onDragEnd={handleFieldDragEnd}
                          onDragOver={(e) => handleFieldDragOver(e, field.id)}
                          onDrop={(e) => handleFieldDrop(e, field.id)}
                          style={{ gridColumn: `span ${field.colSpan ?? GRID_COLUMNS}` }}
                          className={`transition-all rounded-lg ${
                            dropZone?.type === 'merge' && dropZone.targetFieldId === field.id
                              ? 'ring-2 ring-indigo-400 ring-offset-1 bg-indigo-50'
                              : ''
                          }`}
                        >
                          <FormFieldPreview
                            field={field}
                            isSelected={selectedFieldId === field.id}
                            onDelete={onDelete}
                            onSelect={onSelect}
                            isDragging={draggedId === field.id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── Gap zone AFTER last row ── */}
                {sortedRows.length > 0 && (
                  <div
                    onDragOver={(e) => handleRowGapDragOver(e, sortedRows[sortedRows.length - 1][0])}
                    onDrop={(e) => handleRowGapDrop(e, sortedRows[sortedRows.length - 1][0])}
                    className={`h-3 mx-1 rounded transition-all mt-0.5 ${
                      dropZone?.type === 'row' && dropZone.rowKey === sortedRows[sortedRows.length - 1][0]
                        ? 'bg-indigo-300 h-6'
                        : 'hover:bg-indigo-100'
                    }`}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
