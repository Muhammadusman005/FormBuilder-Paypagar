import { useEffect, useState } from 'react';
import type { FormField, FieldValidation } from '../types/form';
import { X, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { isValidRegex } from '../utils/form';
import { COL_SPAN_OPTIONS } from '../constants';

interface Props {
  field: FormField | null;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

export const FieldPropertiesPanel = ({ field, onUpdate, onClose }: Props) => {
  const [label, setLabel] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(4);
  const [validation, setValidation] = useState<FieldValidation>({});

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setPlaceholder(field.placeholder || '');
      setRequired(field.required);
      setOptions(field.options || []);
      setColSpan(field.colSpan ?? 4);
      setValidation(field.validation || {});
    }
  }, [field?.id]);

  if (!field) {
    return (
      <div className="w-64 bg-white border-l border-slate-200 flex items-center justify-center flex-shrink-0">
        <p className="text-xs text-slate-400 text-center px-4">
          Click a field on the canvas to edit its properties
        </p>
      </div>
    );
  }

  const handleChange = (updates: Partial<FormField>) => {
    const updated = { ...field, label, placeholder, required, options, colSpan, validation, ...updates };
    onUpdate(updated);
    if ('label' in updates) setLabel(updates.label!);
    if ('placeholder' in updates) setPlaceholder(updates.placeholder!);
    if ('required' in updates) setRequired(updates.required!);
    if ('options' in updates) setOptions(updates.options!);
    if ('colSpan' in updates) setColSpan(updates.colSpan!);
    if ('validation' in updates) setValidation(updates.validation!);
  };

  const handleValidationChange = (patch: Partial<FieldValidation>) => {
    const updated = { ...validation, ...patch };
    // Remove undefined keys to keep it clean
    (Object.keys(updated) as (keyof FieldValidation)[]).forEach((k) => {
      if (updated[k] === undefined || updated[k] === '') delete updated[k];
    });
    handleChange({ validation: updated });
  };

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    handleChange({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = options.map((o, i) => (i === index ? value : o));
    handleChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    handleChange({ options: newOptions });
  };

  return (
    <div className="w-64 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-800">Properties</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Type (read-only badge) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Field Type
          </label>
          <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-200 capitalize">
            {field.type}
          </span>
        </div>

        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleChange({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden text-ellipsis"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Placeholder
          </label>
          <input
            type="text"
            value={placeholder}
            onChange={(e) => handleChange({ placeholder: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Width */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Width
          </label>
          {/* Visual grid preview */}
          <div className="grid grid-cols-4 gap-1 mb-2">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className={`h-2 rounded-sm transition-colors ${
                  col <= colSpan ? 'bg-indigo-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {COL_SPAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange({ colSpan: opt.value })}
                title={opt.desc}
                className={`py-1.5 text-xs font-medium rounded-md border transition-all ${
                  colSpan === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {COL_SPAN_OPTIONS.find(o => o.value === colSpan)?.desc} — {colSpan} of 4 columns
          </p>
        </div>

        {/* Dropdown Options */}
        {field.type === 'dropdown' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeOption(i)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
          </div>
        )}

        {/* Validation */}
        {(field.type === 'text' || field.type === 'number') && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Validation
              </label>
            </div>

            {/* ── Text validations ── */}
            {field.type === 'text' && (
              <div className="space-y-4">

                {/* Min Length */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Min Length</label>
                  <input
                    type="number"
                    min={0}
                    value={validation.minLength ?? ''}
                    onChange={(e) => handleValidationChange({ minLength: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="No minimum"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validation.minLength !== undefined && (
                    <input
                      type="text"
                      value={validation.minLengthMessage || ''}
                      onChange={(e) => handleValidationChange({ minLengthMessage: e.target.value || undefined })}
                      placeholder={`e.g. Must be at least ${validation.minLength} characters`}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                {/* Max Length */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Max Length</label>
                  <input
                    type="number"
                    min={0}
                    value={validation.maxLength ?? ''}
                    onChange={(e) => handleValidationChange({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="No maximum"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validation.maxLength !== undefined && (
                    <input
                      type="text"
                      value={validation.maxLengthMessage || ''}
                      onChange={(e) => handleValidationChange({ maxLengthMessage: e.target.value || undefined })}
                      placeholder={`e.g. Cannot exceed ${validation.maxLength} characters`}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                {/* Regex Pattern */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Regex Pattern</label>
                  <input
                    type="text"
                    value={validation.regex || ''}
                    onChange={(e) => handleValidationChange({ regex: e.target.value || undefined })}
                    placeholder="e.g. /^[A-Z][a-zA-Z]*$/"
                    className={`w-full px-2.5 py-1.5 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      validation.regex
                        ? isValidRegex(validation.regex)
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-red-400 bg-red-50'
                        : 'border-slate-300'
                    }`}
                  />
                  {validation.regex && (
                    isValidRegex(validation.regex)
                      ? <p className="text-xs text-emerald-600">✓ Valid — strictly enforced</p>
                      : <p className="text-xs text-red-500">✗ Invalid regex — users will be blocked</p>
                  )}
                  {!validation.regex && (
                    <p className="text-xs text-slate-400">Supports /pattern/flags or plain pattern</p>
                  )}
                  {/* Regex error message — only shown when regex is set */}
                  {validation.regex && isValidRegex(validation.regex) && (
                    <input
                      type="text"
                      value={validation.regexMessage || ''}
                      onChange={(e) => handleValidationChange({ regexMessage: e.target.value || undefined })}
                      placeholder="e.g. Must start with a capital letter"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

              </div>
            )}

            {/* ── Number validations ── */}
            {field.type === 'number' && (
              <div className="space-y-4">

                {/* Min Value */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Min Value</label>
                  <input
                    type="number"
                    value={validation.min ?? ''}
                    onChange={(e) => handleValidationChange({ min: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="No minimum"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validation.min !== undefined && (
                    <input
                      type="text"
                      value={validation.minMessage || ''}
                      onChange={(e) => handleValidationChange({ minMessage: e.target.value || undefined })}
                      placeholder={`e.g. Value must be at least ${validation.min}`}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                {/* Max Value */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Max Value</label>
                  <input
                    type="number"
                    value={validation.max ?? ''}
                    onChange={(e) => handleValidationChange({ max: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="No maximum"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validation.max !== undefined && (
                    <input
                      type="text"
                      value={validation.maxMessage || ''}
                      onChange={(e) => handleValidationChange({ maxMessage: e.target.value || undefined })}
                      placeholder={`e.g. Value cannot exceed ${validation.max}`}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Required toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">          <div>
            <p className="text-sm font-medium text-slate-700">Required</p>
            <p className="text-xs text-slate-400">Must be filled before submit</p>
          </div>
          <button
            onClick={() => handleChange({ required: !required })}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              required ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                required ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
