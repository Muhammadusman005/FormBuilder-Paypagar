import type { FormField } from '../types/form';
import { GripVertical, Trash2, ChevronDown, Upload, Type, Hash, Circle, CheckSquare, SplitSquareHorizontal } from 'lucide-react';
import { FIELD_TYPE_META } from '../constants';

interface Props {
  field: FormField;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onSelect: (field: FormField) => void;
  isDragging?: boolean;
}

// Accent colors per field type for the left border
const ACCENT: Record<string, string> = {
  text:       'border-l-blue-400',
  number:     'border-l-purple-400',
  dropdown:   'border-l-amber-400',
  file:       'border-l-emerald-400',
  radio:      'border-l-pink-400',
  checkbox:   'border-l-cyan-400',
  'dual-input': 'border-l-orange-400',
};

export const FormFieldPreview = ({ field, isSelected, onDelete, onSelect, isDragging }: Props) => {
  const meta = FIELD_TYPE_META[field.type];
  const Icon = meta.icon;
  const accent = ACCENT[field.type] ?? 'border-l-slate-300';

  return (
    <div
      onClick={() => onSelect(field)}
      className={`group relative bg-white rounded-lg border border-l-4 transition-all cursor-pointer h-full overflow-hidden ${accent} ${
        isDragging
          ? 'opacity-40 scale-95 shadow-lg border-indigo-300'
          : isSelected
          ? 'border-indigo-400 shadow-md shadow-indigo-100 ring-1 ring-indigo-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top row: drag handle + type badge + actions */}
      <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-1">
        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0 cursor-move" />

        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${meta.color}`}>
          <Icon className="w-2.5 h-2.5" />
          {meta.label}
        </span>

        {field.required && (
          <span className="text-[10px] font-semibold text-red-500 flex-shrink-0">Required</span>
        )}

        <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
            className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Label */}
      <div className="px-2.5 pb-1">
        <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
          {field.label || <span className="text-slate-400 italic">Untitled</span>}
        </p>
      </div>

      {/* Input preview */}
      <div className="px-2.5 pb-2.5">
        {(field.type === 'text') && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center">
            <Type className="w-2.5 h-2.5 text-slate-300 mr-1.5 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{field.placeholder || 'Text input'}</span>
          </div>
        )}
        {field.type === 'number' && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center">
            <Hash className="w-2.5 h-2.5 text-slate-300 mr-1.5 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{field.placeholder || 'Number input'}</span>
          </div>
        )}
        {field.type === 'dropdown' && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 truncate flex-1">{field.placeholder || 'Select option'}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-300 flex-shrink-0 ml-1" />
          </div>
        )}
        {field.type === 'file' && (
          <div className="h-6 bg-slate-50 border border-dashed border-slate-300 rounded px-2 flex items-center gap-1">
            <Upload className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{field.placeholder || 'Upload file'}</span>
          </div>
        )}
        {field.type === 'radio' && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center gap-1.5">
            <Circle className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{(field.options?.length ?? 0) > 0 ? `${field.options!.length} options` : 'No options'}</span>
          </div>
        )}
        {field.type === 'checkbox' && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center gap-1.5">
            <CheckSquare className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{(field.options?.length ?? 0) > 0 ? `${field.options!.length} options` : 'No options'}</span>
          </div>
        )}
        {field.type === 'dual-input' && (
          <div className="h-6 bg-slate-50 border border-slate-200 rounded px-2 flex items-center gap-1.5">
            <SplitSquareHorizontal className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{field.dualInputLabels?.[0] ?? 'Min'} / {field.dualInputLabels?.[1] ?? 'Max'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
