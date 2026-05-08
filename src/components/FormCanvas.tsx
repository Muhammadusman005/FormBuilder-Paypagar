import { useState, useCallback } from 'react';
import type { FormField } from '../types/form';
import { FormFieldPreview } from './FormFieldPreview';
import { Layers, Plus, ArrowDown } from 'lucide-react';
import { GRID_COLUMNS } from '../constants';
import { mergeFieldIntoRow, moveFieldToNewRow } from '../utils/fieldLayout';

const DT_FIELD_ID = 'application/x-field-id';
const DT_PALETTE  = 'application/x-palette-type';

interface Props {
  title: string;
  fields: FormField[];
  selectedFieldId: string | null;
  draggedId: string | null;
  draggedComponentType?: string | null;
  onFieldDragStart: (id: string) => void;
  onFieldDragEnd: () => void;
  onFieldsUpdate: (fields: FormField[]) => void;
  onDelete: (id: string) => void;
  onSelect: (field: FormField) => void;
  onCanvasDrop: (e: React.DragEvent) => void;
  onCanvasDropIntoRow?: (e: React.DragEvent, targetRow: number, insertAtIndex: number) => void;
}

type DropTarget =
  | { kind: 'row-gap'; afterRowKey: number }
  | { kind: 'slot'; rowKey: number; slotIndex: number }
  | null;

// ── Stable sub-components (outside FormCanvas to avoid remount on re-render) ─

interface DropSlotProps {
  rowKey: number;
  slotIndex: number;
  isActive: boolean;
  onDragOver: (e: React.DragEvent, rowKey: number, slotIndex: number) => void;
  onDrop:     (e: React.DragEvent, rowKey: number, slotIndex: number) => void;
}

const DropSlot = ({ rowKey, slotIndex, isActive, onDragOver, onDrop }: DropSlotProps) => (
  <div
    onDragOver={e => onDragOver(e, rowKey, slotIndex)}
    onDrop={e => onDrop(e, rowKey, slotIndex)}
    className={`flex items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
      isActive
        ? 'border-indigo-400 bg-indigo-50'
        : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/60'
    }`}
    style={{ minHeight: 76 }}
  >
    <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-indigo-500' : 'text-slate-300'}`}>
      <Plus className="w-4 h-4" />
      {isActive && <span className="text-[10px] font-semibold">Drop here</span>}
    </div>
  </div>
);

interface RowGapProps {
  afterRowKey: number;
  isActive:   boolean;
  isAnyDrag:  boolean;
  onDragOver: (e: React.DragEvent, afterRowKey: number) => void;
  onDrop:     (e: React.DragEvent, afterRowKey: number) => void;
}

const RowGap = ({ afterRowKey, isActive, isAnyDrag, onDragOver, onDrop }: RowGapProps) => (
  <div
    onDragOver={e => onDragOver(e, afterRowKey)}
    onDrop={e => onDrop(e, afterRowKey)}
    className={`mx-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
      isActive
        ? 'h-10 border-2 border-dashed border-indigo-400 bg-indigo-50'
        : isAnyDrag
        ? 'h-5 border border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/40'
        : 'h-2'
    }`}
  >
    {isActive && (
      <>
        <ArrowDown className="w-3 h-3 text-indigo-400" />
        <span className="text-xs text-indigo-500 font-medium">New row here</span>
      </>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────

export const FormCanvas = ({
  title,
  fields,
  selectedFieldId,
  draggedId,
  draggedComponentType,
  onFieldDragStart,
  onFieldDragEnd,
  onFieldsUpdate,
  onDelete,
  onSelect,
  onCanvasDrop,
  onCanvasDropIntoRow,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  const isDraggingField   = !!draggedId;
  const isDraggingPalette = !!draggedComponentType && !draggedId;
  const isAnyDrag         = isDraggingField || isDraggingPalette;

  // Group fields by row
  const groupedRows = fields.reduce<Map<number, FormField[]>>((acc, field) => {
    const rowKey = field.row ?? 0;
    if (!acc.has(rowKey)) acc.set(rowKey, []);
    acc.get(rowKey)!.push(field);
    return acc;
  }, new Map());
  const sortedRows = Array.from(groupedRows.entries()).sort(([a], [b]) => a - b);

  // ── Canvas handlers ────────────────────────────────────────────
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (fields.length === 0) setIsDragOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropTarget(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    setDropTarget(null);
    onCanvasDrop(e);
  };

  // ── Field drag handlers ────────────────────────────────────────
  const handleFieldDragStart = useCallback((e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(DT_FIELD_ID, fieldId);
    onFieldDragStart(fieldId);
  }, [onFieldDragStart]);

  const handleFieldDragEnd = useCallback(() => {
    setDropTarget(null);
    onFieldDragEnd();
  }, [onFieldDragEnd]);

  // ── Slot handlers ──────────────────────────────────────────────
  const handleSlotDragOver = useCallback((e: React.DragEvent, rowKey: number, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ kind: 'slot', rowKey, slotIndex });
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, rowKey: number, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    const fieldId     = e.dataTransfer.getData(DT_FIELD_ID);
    const paletteType = e.dataTransfer.getData(DT_PALETTE);

    if (paletteType && onCanvasDropIntoRow) {
      onCanvasDropIntoRow(e, rowKey, slotIndex);
      return;
    }
    if (fieldId) {
      onFieldsUpdate(mergeFieldIntoRow(fields, fieldId, rowKey, slotIndex));
    }
  }, [fields, onFieldsUpdate, onCanvasDropIntoRow]);

  // ── Row gap handlers ───────────────────────────────────────────
  const handleRowGapDragOver = useCallback((e: React.DragEvent, afterRowKey: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ kind: 'row-gap', afterRowKey });
  }, []);

  const handleRowGapDrop = useCallback((e: React.DragEvent, afterRowKey: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    const fieldId     = e.dataTransfer.getData(DT_FIELD_ID);
    const paletteType = e.dataTransfer.getData(DT_PALETTE);

    if (paletteType && onCanvasDropIntoRow) {
      onCanvasDropIntoRow(e, afterRowKey, -1);
      return;
    }
    if (fieldId) {
      onFieldsUpdate(moveFieldToNewRow(fields, fieldId, afterRowKey));
    }
  }, [fields, onFieldsUpdate, onCanvasDropIntoRow]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/80">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Canvas</p>
          {fields.length > 0 && (
            <p className="text-xs text-slate-400">
              {fields.length} field{fields.length !== 1 ? 's' : ''} · {sortedRows.length} row{sortedRows.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          className={`bg-white rounded-xl shadow-sm transition-all ${
            isDragOver && fields.length === 0
              ? 'ring-2 ring-indigo-400 ring-offset-2'
              : 'ring-1 ring-slate-200'
          }`}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{title || 'Untitled Form'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {fields.length === 0 ? 'No fields yet' : `${fields.length} field${fields.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {fields.length > 0 && (
              <div className="flex items-center gap-1">
                {sortedRows.map(([rowKey, rowFields]) => (
                  <div key={rowKey} className="flex gap-0.5" title={`Row ${rowKey + 1}`}>
                    {rowFields.map(f => (
                      <div
                        key={f.id}
                        className={`h-1.5 rounded-full ${selectedFieldId === f.id ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        style={{ width: `${(f.colSpan ?? 4) * 4}px` }}
                      />
                    ))}
                    <div className="w-px bg-slate-200 mx-0.5" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4">
            {fields.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed transition-all ${
                isDragOver ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDragOver ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  <Layers className={`w-5 h-5 ${isDragOver ? 'text-indigo-500' : 'text-slate-400'}`} />
                </div>
                <p className={`text-sm font-medium ${isDragOver ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {isDragOver ? 'Release to add field' : 'Drag a field here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Or click a field in the left panel</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {sortedRows.map(([rowKey, rowFields], rowIndex) => {
                  // Calculate how many grid columns each item should take.
                  // During drag: each field shrinks by 1 col to make room for ONE slot.
                  // We only show ONE slot at a time (the active one or the "after" slot).
                  // To keep layout stable, we always show slots but give them minimal space
                  // unless active.
                  const fieldCount = rowFields.length;
                  // Total grid cols used by fields during drag (each field keeps its colSpan)
                  // Slots each take 1 col. We show fieldCount+1 slots during drag.
                  // So we need: sum(fieldColSpans) + (fieldCount+1)*1 <= GRID_COLUMNS
                  // We achieve this by reducing each field's colSpan proportionally.
                  // Simple approach: each field gets colSpan - floor(colSpan * slotsNeeded / totalCols)
                  // Even simpler: just use a separate flex row for drag mode.

                  return (
                    <div key={rowKey}>
                      {rowIndex > 0 && (
                        <RowGap
                          afterRowKey={sortedRows[rowIndex - 1][0]}
                          isActive={dropTarget?.kind === 'row-gap' && dropTarget.afterRowKey === sortedRows[rowIndex - 1][0]}
                          isAnyDrag={isAnyDrag}
                          onDragOver={handleRowGapDragOver}
                          onDrop={handleRowGapDrop}
                        />
                      )}

                      {/* Row label */}
                      <div className="flex items-center gap-2 mb-1.5 px-0.5">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                          Row {rowIndex + 1}
                        </span>
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] text-slate-300">
                          {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* ── Normal mode: CSS grid ── */}
                      {!isAnyDrag && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
                            gap: 10,
                          }}
                        >
                          {rowFields.map(field => (
                            <div
                              key={field.id}
                              draggable
                              onDragStart={e => handleFieldDragStart(e, field.id)}
                              onDragEnd={handleFieldDragEnd}
                              style={{ gridColumn: `span ${field.colSpan ?? GRID_COLUMNS}` }}
                            >
                              <FormFieldPreview
                                field={field}
                                isSelected={selectedFieldId === field.id}
                                onDelete={onDelete}
                                onSelect={onSelect}
                                isDragging={false}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Drag mode: flex row with slots ── */}
                      {isAnyDrag && (
                        <div className="flex gap-2 items-stretch">
                          {rowFields.map((field, fieldIndex) => (
                            <div key={field.id} className="contents">
                              {/* Slot before this field */}
                              <div className="flex-none w-14">
                                <DropSlot
                                  rowKey={rowKey}
                                  slotIndex={fieldIndex}
                                  isActive={
                                    dropTarget?.kind === 'slot' &&
                                    dropTarget.rowKey === rowKey &&
                                    dropTarget.slotIndex === fieldIndex
                                  }
                                  onDragOver={handleSlotDragOver}
                                  onDrop={handleSlotDrop}
                                />
                              </div>

                              {/* Field card */}
                              <div
                                className="flex-1 min-w-0"
                                draggable
                                onDragStart={e => handleFieldDragStart(e, field.id)}
                                onDragEnd={handleFieldDragEnd}
                              >
                                <FormFieldPreview
                                  field={field}
                                  isSelected={selectedFieldId === field.id}
                                  onDelete={onDelete}
                                  onSelect={onSelect}
                                  isDragging={draggedId === field.id}
                                />
                              </div>
                            </div>
                          ))}

                          {/* Slot after last field */}
                          <div className="flex-none w-14">
                            <DropSlot
                              rowKey={rowKey}
                              slotIndex={rowFields.length}
                              isActive={
                                dropTarget?.kind === 'slot' &&
                                dropTarget.rowKey === rowKey &&
                                dropTarget.slotIndex === rowFields.length
                              }
                              onDragOver={handleSlotDragOver}
                              onDrop={handleSlotDrop}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Gap after last row */}
                <RowGap
                  afterRowKey={sortedRows[sortedRows.length - 1][0]}
                  isActive={
                    dropTarget?.kind === 'row-gap' &&
                    dropTarget.afterRowKey === sortedRows[sortedRows.length - 1][0]
                  }
                  isAnyDrag={isAnyDrag}
                  onDragOver={handleRowGapDragOver}
                  onDrop={handleRowGapDrop}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hint */}
        {fields.length > 0 && !isAnyDrag && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Drag fields to reorder · Drop on a row to merge · Click to edit properties
          </p>
        )}
        {isAnyDrag && (
          <p className="text-center text-xs text-indigo-500 font-medium mt-3">
            Drop on <strong>+</strong> to add to that row · Drop between rows for a new row
          </p>
        )}
      </div>
    </div>
  );
};
