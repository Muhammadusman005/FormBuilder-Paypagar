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
      className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer h-full overflow-hidden ${
        isDragging
          ? 'opacity-40 scale-95 border-indigo-400 shadow-lg'
          : isSelected
          ? 'border-indigo-500 shadow-md shadow-indigo-100'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg" />
      )}

      <div className="flex items-center gap-2 px-3 py-2.5 overflow-hidden">
        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 cursor-move" />

        <div className={`flex items-center justify-center w-6 h-6 rounded-md border flex-shrink-0 ${meta.color}`}>
          <Icon className="w-3 h-3" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs font-medium text-slate-800 truncate">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </p>
          <p className="text-xs text-slate-400 truncate">{meta.label}</p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(field); }}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Input preview */}
      <div className="px-3 pb-3 overflow-hidden">
        {field.type === 'text' && (
          <div className="h-7 bg-slate-50 border border-slate-200 rounded px-2 flex items-center overflow-hidden">
            <span className="text-xs text-slate-400 truncate w-full">{field.placeholder || 'Enter text...'}</span>
          </div>
        )}
        {field.type === 'number' && (
          <div className="h-7 bg-slate-50 border border-slate-200 rounded px-2 flex items-center overflow-hidden">
            <span className="text-xs text-slate-400 truncate w-full">{field.placeholder || 'Enter number...'}</span>
          </div>
        )}
        {field.type === 'dropdown' && (
          <div className="h-7 bg-slate-50 border border-slate-200 rounded px-2 flex items-center justify-between overflow-hidden">
            <span className="text-xs text-slate-400 truncate flex-1">{field.placeholder || 'Select an option'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0 ml-1" />
          </div>
        )}
        {field.type === 'file' && (
          <div className="h-7 bg-slate-50 border border-dashed border-slate-300 rounded px-2 flex items-center gap-1 overflow-hidden">
            <Upload className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 truncate">{field.placeholder || 'Upload file'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
