/**
 * FieldInput
 *
 * Centralized field renderer for all field types.
 * Used by FormPreview (builder tab) and SubmitForm (public page).
 *
 * Handles:
 * - Rendering the correct input type
 * - Displaying validation errors
 * - File input reset key
 */
import type { FormField } from '../../types/form';

interface Props {
  field: FormField;
  value: unknown;
  error: string | null;
  onChange: (value: unknown) => void;
  fileResetKey?: number;
  /** Additional CSS classes for the input wrapper */
  className?: string;
}

export const FieldInput = ({ field, value, error, onChange, fileResetKey, className = '' }: Props) => {
  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
    error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
  }`;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      )}

      {field.type === 'dropdown' && (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === 'file' && (
        <input
          key={fileResetKey}
          type="file"
          onChange={(e) => onChange(e.target.files?.[0])}
          className={inputClasses}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
