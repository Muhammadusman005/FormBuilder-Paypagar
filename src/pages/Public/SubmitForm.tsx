import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { FormField } from '../../types/form';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { validateField } from '../../utils/validation';

export const SubmitForm = () => {
  const { id } = useParams();
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileResetKey, setFileResetKey] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setFields([
        { id: '1', type: 'text', label: 'First Name', required: true, placeholder: 'Enter first name' },
        { id: '2', type: 'text', label: 'Last Name', required: true, placeholder: 'Enter last name' },
        { id: '3', type: 'text', label: 'Email', required: true, placeholder: 'Enter email' },
        { id: '4', type: 'number', label: 'Age', required: false, placeholder: 'Enter age' },
        { id: '5', type: 'dropdown', label: 'Country', required: true, options: ['USA', 'Canada', 'UK', 'Other'] },
        { id: '6', type: 'file', label: 'Profile Picture', required: false },
      ]);
      setLoading(false);
    }, 600);
  }, [id]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const err = validateField(field, String(value ?? ''));
      setFieldErrors(prev => ({ ...prev, [fieldId]: err ?? '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run all validations before submit
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
      const err = validateField(field, String(formData[field.id] ?? ''));
      if (err) errors[field.id] = err;
    }

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    console.log('Form submitted:', formData);
    setFileResetKey(k => k + 1);
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
          <p className="text-slate-500 text-sm mb-6">Your response has been recorded. Thank you for filling out this form.</p>
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

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <div>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        fieldErrors[field.id] ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                    {fieldErrors[field.id] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[field.id]}</p>
                    )}
                  </div>
                )}

                {field.type === 'number' && (
                  <div>
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        fieldErrors[field.id] ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                    {fieldErrors[field.id] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[field.id]}</p>
                    )}
                  </div>
                )}

                {field.type === 'dropdown' && (
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select an option</option>
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
                    onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
                    required={field.required}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
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
