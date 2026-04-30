import type { FormField } from '../types/form';
import { Layers } from 'lucide-react';
import { FieldInput, FormGrid } from '../components/shared';
import { useFormState } from '../hooks';

interface Props {
  title: string;
  fields: FormField[];
  formData: Record<string, unknown>;
  onInputChange: (fieldId: string, value: unknown) => void;
  onSubmit: () => void;
}

export const FormPreview = ({ title, fields, formData, onInputChange, onSubmit }: Props) => {
  const { errors, fileResetKey, handleChange, handleSubmit, resetForm } = useFormState();

  const handleFieldChange = (field: FormField, value: unknown) => {
    handleChange(field.id, value, field);
    onInputChange(field.id, value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, fields, () => {
      onSubmit();
      resetForm();
    });
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
            <form onSubmit={handleFormSubmit} noValidate className="p-6">
              <FormGrid
                fields={fields}
                gap={20}
                renderField={(field) => (
                  <FieldInput
                    field={field}
                    value={formData[field.id]}
                    error={errors[field.id] ?? null}
                    onChange={(value) => handleFieldChange(field, value)}
                    fileResetKey={fileResetKey}
                  />
                )}
              />

              <button
                type="submit"
                className="w-full mt-6 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
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
