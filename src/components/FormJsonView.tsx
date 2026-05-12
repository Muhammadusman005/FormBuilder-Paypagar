import { useState, useEffect } from 'react';
import type { FormSchema } from '../types/form';
import { Copy, CheckCheck, Check, AlertCircle } from 'lucide-react';

interface Props {
  form: FormSchema;
  onFormChange?: (updated: FormSchema) => void;
}

export const FormJsonView = ({ form, onFormChange }: Props) => {
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  // Sync jsonText whenever form changes from outside (e.g. field added in designer)
  useEffect(() => {
    setJsonText(JSON.stringify(form, null, 2));
    setError(null);
  }, [form]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText) as FormSchema;

      // Basic validation
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.sub_forms)) {
        setError('Invalid structure: must have id, name, and sub_forms array.');
        return;
      }

      setError(null);
      onFormChange?.(parsed);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    } catch (e) {
      setError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const handleChange = (value: string) => {
    setJsonText(value);
    // Live validation
    try {
      JSON.parse(value);
      setError(null);
    } catch (e) {
      setError(`${(e as Error).message}`);
    }
  };

  const isValid = error === null;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Form JSON Schema</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit JSON directly — click Apply to update the form
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {copied
                  ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>

              {onFormChange && (
                <button
                  onClick={handleApply}
                  disabled={!isValid}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    applied
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isValid
                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {applied
                    ? <><Check className="w-3.5 h-3.5" /> Applied!</>
                    : <>Apply Changes</>
                  }
                </button>
              )}
            </div>
          </div>

          {/* Error bar */}
          {error && (
            <div className="flex items-start gap-2 px-5 py-2.5 bg-red-50 border-b border-red-200">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-mono">{error}</p>
            </div>
          )}

          {/* Editable textarea */}
          <textarea
            value={jsonText}
            onChange={(e) => handleChange(e.target.value)}
            spellCheck={false}
            className={`w-full p-5 text-xs leading-relaxed font-mono bg-[#fafafa] resize-none outline-none min-h-[520px] border-0 transition-colors ${
              error ? 'bg-red-50/30' : ''
            }`}
            style={{ tabSize: 2 }}
            onKeyDown={(e) => {
              // Tab key inserts 2 spaces instead of changing focus
              if (e.key === 'Tab') {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const newVal = jsonText.substring(0, start) + '  ' + jsonText.substring(end);
                setJsonText(newVal);
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2;
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
