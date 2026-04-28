import { useState } from 'react';
import type { FormField } from '../types/form';
import { Layers } from 'lucide-react';

interface Props {
  title: string;
  fields: FormField[];
  formData: Record<string, any>;
  onInputChange: (fieldId: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FieldInput = ({
  field,
  formData,
  onInputChange,
  resetKey,
}: {
  field: FormField;
  formData: Record<string, any>;
  onInputChange: (id: string, value: any) => void;
  resetKey: number;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>

    {field.type === 'text' && (
      <input
        type="text"
        placeholder={field.placeholder}
        value={formData[field.id] || ''}
        onChange={(e) => onInputChange(field.id, e.target.value)}
        required={field.required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )}

    {field.type === 'number' && (
      <input
        type="number"
        placeholder={field.placeholder}
        value={formData[field.id] || ''}
        onChange={(e) => onInputChange(field.id, e.target.value)}
        required={field.required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )}

    {field.type === 'dropdown' && (
      <select
        value={formData[field.id] || ''}
        onChange={(e) => onInputChange(field.id, e.target.value)}
        required={field.required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">{field.placeholder || 'Select an option'}</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )}

    {field.type === 'file' && (
      <input
        key={resetKey}
        type="file"
        onChange={(e) => onInputChange(field.id, e.target.files?.[0])}
        required={field.required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )}
  </div>
);

export const FormPreview = ({ title, fields, formData, onInputChange, onSubmit }: Props) => {
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    setResetKey(k => k + 1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">{title || 'Untitled Form'}</h2>
            <p className="text-indigo-200 text-sm mt-1">Preview how your form looks</p>
          </div>

          {fields.length === 0 ? (
            <div className="p-6 text-center py-12 text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No fields added yet. Add fields in Designer tab to preview.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                {fields.map((field) => (
                  <div key={field.id} style={{ gridColumn: `span ${field.colSpan ?? 4}` }}>
                    <FieldInput
                      field={field}
                      formData={formData}
                      onInputChange={onInputChange}
                      resetKey={resetKey}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Submit Form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
