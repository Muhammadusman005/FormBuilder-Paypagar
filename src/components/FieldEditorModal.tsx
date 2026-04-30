import { useState } from 'react';
import type { FormField, FieldType } from '../types/form';
import { X } from 'lucide-react';
import { generateId } from '../utils/form';

interface Props {
  field?: FormField;
  onSave: (field: FormField) => void;
  onClose: () => void;
}

export const FieldEditorModal = ({ field, onSave, onClose }: Props) => {
  const [type, setType] = useState<FieldType>(field?.type || 'text');
  const [label, setLabel] = useState(field?.label || '');
  const [required, setRequired] = useState(field?.required || false);
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [options, setOptions] = useState((field?.options || []).join('\n'));

  const [labelError, setLabelError] = useState('');

  const handleSave = () => {
    if (!label.trim()) {
      setLabelError('Label is required');
      return;
    }
    setLabelError('');

    onSave({
      id: field?.id || generateId(),
      type,
      label: label.trim(),
      required,
      placeholder,
      options: type === 'dropdown' ? options.split('\n').filter(o => o.trim()) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-900">
            {field ? 'Edit Field' : 'Add Field'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Field Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="text">Text Input</option>
              <option value="number">Number</option>
              <option value="dropdown">Dropdown</option>
              <option value="file">File Upload</option>
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => { setLabel(e.target.value); if (labelError) setLabelError(''); }}
              placeholder="e.g., First Name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                labelError ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {labelError && <p className="mt-1 text-xs text-red-500">{labelError}</p>}
          </div>

          {/* Placeholder */}
          {type !== 'file' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Placeholder</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="e.g., Enter your name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Dropdown Options */}
          {type === 'dropdown' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Options (one per line)</label>
              <textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
          )}

          {/* Required */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="required" className="text-sm font-medium text-slate-700">
              Required field
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Save Field
          </button>
        </div>
      </div>
    </div>
  );
};
