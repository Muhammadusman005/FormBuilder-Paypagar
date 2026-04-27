import type { FormField } from '../types/form';
import { GripVertical, Pencil, Trash2, Type, Hash, ChevronDown, Upload } from 'lucide-react';

interface Props {
  field: FormField;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onSelect: (field: FormField) => void;
  isDragging?: boolean;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  text:     { label: 'Text',     icon: Type,        color: 'bg-blue-50 text-blue-600 border-blue-200' },
  number:   { label: 'Number',   icon: Hash,        color: 'bg-purple-50 text-purple-600 border-purple-200' },
  dropdown: { label: 'Dropdown', icon: ChevronDown, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  file:     { label: 'File',     icon: Upload,      color: 'bg-green-50 text-green-600 border-green-200' },
};

export const FormFieldPreview = ({ field, isSelected, onDelete, onSelect, isDragging }: Props) => {
  const meta = TYPE_META[field.type];
  const Icon = meta.icon;

  return (
    <div
      onClick={() => onSelect(field)}
      className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
        isDragging
          ? 'opacity-40 scale-95 border-indigo-400 shadow-lg'
          : isSelected
          ? 'border-indigo-500 shadow-md shadow-indigo-100'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      {/* Selected indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg" />
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 cursor-move" />

        {/* Type icon */}
        <div className={`flex items-center justify-center w-7 h-7 rounded-md border text-xs flex-shrink-0 ${meta.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        {/* Label + type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <p className="text-xs text-slate-400">{meta.label}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(field); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Field preview */}
      <div className="px-4 pb-3 pl-14">
        {field.type === 'text' && (
          <div className="h-8 bg-slate-50 border border-slate-200 rounded-md px-2 flex items-center">
            <span className="text-xs text-slate-400">{field.placeholder || 'Enter text...'}</span>
          </div>
        )}
        {field.type === 'number' && (
          <div className="h-8 bg-slate-50 border border-slate-200 rounded-md px-2 flex items-center">
            <span className="text-xs text-slate-400">{field.placeholder || 'Enter number...'}</span>
          </div>
        )}
        {field.type === 'dropdown' && (
          <div className="h-8 bg-slate-50 border border-slate-200 rounded-md px-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{field.placeholder || 'Select an option'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        )}
        {field.type === 'file' && (
          <div className="h-8 bg-slate-50 border border-dashed border-slate-300 rounded-md px-2 flex items-center gap-1.5">
            <Upload className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">Click to upload file</span>
          </div>
        )}
      </div>
    </div>
  );
};
