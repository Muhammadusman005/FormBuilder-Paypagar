import { useState } from 'react';
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
  onFieldDrop: (targetId: string) => void;
  onDelete: (id: string) => void;
  onSelect: (field: FormField) => void;
  onCanvasDrop: (e: React.DragEvent) => void;
}

export const FormCanvas = ({
  title,
  fields,
  selectedFieldId,
  draggedId,
  onFieldDragStart,
  onFieldDrop,
  onDelete,
  onSelect,
  onCanvasDrop,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onCanvasDrop(e);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Canvas</p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
              /* 4-column grid using inline styles to avoid Tailwind purging */
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`, gap: '12px' }}>
                {fields.map((field) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => onFieldDragStart(field.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onFieldDrop(field.id)}
                    style={{ gridColumn: `span ${field.colSpan ?? GRID_COLUMNS}` }}
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

                {isDragOver && (
                  <div
                    style={{ gridColumn: `span ${GRID_COLUMNS}` }}
                    className="h-12 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50 flex items-center justify-center"
                  >
                    <p className="text-xs text-indigo-500 font-medium">Drop here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
