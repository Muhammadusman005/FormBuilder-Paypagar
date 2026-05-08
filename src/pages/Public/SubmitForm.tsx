import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { FormField } from '../../types/form';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { FieldInput, FormGrid } from '../../components/shared';
import { useFormState } from '../../hooks';
import { logFormSubmission } from '../../utils/fileValidation';

export const SubmitForm = () => {
  const { id } = useParams();
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const { formData, errors, fileResetKey, handleChange, handleSubmit, resetForm } = useFormState();

  useEffect(() => {
    // TODO: replace with FormService.getFormById(id)
    setTimeout(() => {
      setFields([
        { id: '1', type: 'text',     label: 'First Name',      required: true,  placeholder: 'Enter first name' },
        { id: '2', type: 'text',     label: 'Last Name',       required: true,  placeholder: 'Enter last name' },
        { id: '3', type: 'text',     label: 'Email',           required: true,  placeholder: 'Enter email' },
        { id: '4', type: 'number',   label: 'Age',             required: false, placeholder: 'Enter age' },
        { id: '5', type: 'dropdown', label: 'Country',         required: true,  options: ['USA', 'Canada', 'UK', 'Other'] },
        { id: '6', type: 'file',     label: 'Profile Picture', required: false },
      ]);
      setLoading(false);
    }, 600);
  }, [id]);

  const onSuccess = () => {
    logFormSubmission(fields, formData);
    resetForm();
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your response has been recorded. Thank you for filling out this form.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h1 className="text-xl font-bold text-white">Customer Feedback Survey</h1>
            <p className="text-indigo-200 text-sm mt-1">All fields marked * are required</p>
          </div>

          <form
            onSubmit={(e) => handleSubmit(e, fields, onSuccess)}
            noValidate
            className="px-8 py-6"
          >
            <FormGrid
              fields={fields}
              gap={24}
              renderField={(field) => (
                <FieldInput
                  field={field}
                  value={formData[field.id]}
                  error={errors[field.id] ?? null}
                  onChange={(value) => handleChange(field.id, value, field)}
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
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by <span className="text-indigo-500 font-medium">FormBuilder Pro</span>
        </p>
      </div>
    </div>
  );
};
