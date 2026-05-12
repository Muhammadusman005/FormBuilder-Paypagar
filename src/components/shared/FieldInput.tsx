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
import { getAcceptAttribute, validateAndLogFile, logFieldInput } from '../../utils/fileValidation';

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
          onChange={(e) => {
            logFieldInput(field.label, field.id, e.target.value);
            onChange(e.target.value);
          }}
          className={inputClasses}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => {
            logFieldInput(field.label, field.id, e.target.value);
            onChange(e.target.value);
          }}
          className={inputClasses}
        />
      )}

      {field.type === 'dropdown' && (
        <select
          value={String(value ?? '')}
          onChange={(e) => {
            logFieldInput(field.label, field.id, e.target.value);
            onChange(e.target.value);
          }}
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
          accept={getAcceptAttribute(field.acceptedFileTypes)}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const isValid = validateAndLogFile(file, field.label, field.id, field.acceptedFileTypes);
              if (!isValid) {
                e.target.value = ''; // Clear the input
                return;
              }
            }
            onChange(file);
          }}
          className={inputClasses}
        />
      )}

      {field.type === 'radio' && (
        <div className="space-y-1.5">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className="space-y-1.5">
          {field.options?.map((opt) => {
            const selected = Array.isArray(value) ? (value as string[]).includes(opt) : false;
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  value={opt}
                  checked={selected}
                  onChange={(e) => {
                    const arr = Array.isArray(value) ? [...(value as string[])] : [];
                    if (e.target.checked) {
                      arr.push(opt);
                    } else {
                      const idx = arr.indexOf(opt);
                      if (idx !== -1) arr.splice(idx, 1);
                    }
                    onChange(arr);
                  }}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.type === 'dual-input' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {(field.dualInputLabels?.[0]) || 'First'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={(value as { first?: string })?.first ?? ''}
              onChange={(e) => onChange({ ...(value as object || {}), first: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {(field.dualInputLabels?.[1]) || 'Second'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={(value as { second?: string })?.second ?? ''}
              onChange={(e) => onChange({ ...(value as object || {}), second: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
