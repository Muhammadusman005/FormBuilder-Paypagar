import { useState } from 'react';
import type { FormField } from '../types/form';
import { Layers } from 'lucide-react';
import { validateField } from '../utils/validation';

interface Props {
  title: string;
  fields: FormField[];
  formData: Record<string, any>;
  onInputChange: (fieldId: string, value: any) => void;
  onSubmit: () => void;
}

function FieldInput({
  field,
  formData,
  onInputChange,
  resetKey,
  error,
  onError,
}: {
  field: FormField;
  formData: Record<string, any>;
  onInputChange: (id: string, value: any) => void;
  resetKey: number;
  error: string | null;
  onError: (id: string, err: string | null) => void;
}) {
  const handleChange = (value: string) => {
    onInputChange(field.id, value);
    onError(field.id, validateField(field, value));
  };

  return (
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
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
          }`}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          placeholder={field.placeholder}
          value={formData[field.id] || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
          }`}
        />
      )}

      {field.type === 'dropdown' && (
        <select
          value={formData[field.id] || ''}
          onChange={(e) => onInputChange(field.id, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
          }`}
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
          }`}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export const FormPreview = ({ title, fields, formData, onInputChange, onSubmit }: Props) => {
  const [resetKey, setResetKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleError = (id: string, err: string | null) => {
    setErrors(prev => ({ ...prev, [id]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string | null> = {};
    let hasError = false;

    for (const field of fields) {
      const value = String(formData[field.id] ?? '');
      const err = validateField(field, value);
      newErrors[field.id] = err;
      if (err) hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    onSubmit();
    setErrors({});
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
            <form onSubmit={handleSubmit} noValidate className="p-6">
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
                      error={errors[field.id] ?? null}
                      onError={handleError}
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
