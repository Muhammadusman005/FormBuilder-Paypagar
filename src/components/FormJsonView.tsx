import { useState } from 'react';
import type { FormField } from '../types/form';
import { Copy, CheckCheck } from 'lucide-react';

interface Props {
  title: string;
  fields: FormField[];
}

// Map our internal field types to the JSON schema types
const toSchemaType = (type: FormField['type']): string => {
  switch (type) {
    case 'text':     return 'text';
    case 'number':   return 'number';
    case 'dropdown': return 'dropdown';
    case 'file':     return 'file';
    default:         return 'text';
  }
};

const buildSchema = (title: string, fields: FormField[]) => ({
  pages: [
    {
      name: 'page1',
      title,
      elements: fields.map((field, index) => {
        const base: Record<string, any> = {
          type: toSchemaType(field.type),
          name: `question${index + 1}`,
          title: field.label,
          isRequired: field.required,
        };

        if (field.placeholder) {
          base.placeholder = field.placeholder;
        }

        if (field.type === 'dropdown' && field.options?.length) {
          base.choices = field.options;
        }

        // Include validation only if any rule is configured
        if (field.validation && Object.keys(field.validation).length > 0) {
          const v = field.validation;
          const validation: Record<string, any> = {};

          if (v.regex)              validation.regex            = v.regex;
          if (v.regexMessage)       validation.regexMessage     = v.regexMessage;
          if (v.minLength !== undefined) validation.minLength   = v.minLength;
          if (v.minLengthMessage)   validation.minLengthMessage = v.minLengthMessage;
          if (v.maxLength !== undefined) validation.maxLength   = v.maxLength;
          if (v.maxLengthMessage)   validation.maxLengthMessage = v.maxLengthMessage;
          if (v.min !== undefined)  validation.min              = v.min;
          if (v.minMessage)         validation.minMessage       = v.minMessage;
          if (v.max !== undefined)  validation.max              = v.max;
          if (v.maxMessage)         validation.maxMessage       = v.maxMessage;

          if (Object.keys(validation).length > 0) {
            base.validation = validation;
          }
        }

        return base;
      }),
    },
  ],
});

export const FormJsonView = ({ title, fields }: Props) => {
  const [copied, setCopied] = useState(false);

  const schema = buildSchema(title, fields);
  const jsonString = JSON.stringify(schema, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Form JSON Schema</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {fields.length} field{fields.length !== 1 ? 's' : ''} · live preview
              </p>
            </div>
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
                : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>
              }
            </button>
          </div>

          {/* JSON output */}
          {fields.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p className="text-sm">No fields added yet.</p>
              <p className="text-xs mt-1">Add fields in the Designer tab to see the JSON schema.</p>
            </div>
          ) : (
            <pre className="p-5 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono bg-[#fafafa]">
              {jsonString}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
