import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import type { FormSchema, SubForm } from '../../types/form';
import { storageService } from '../../services/storage.service';

export const FormDetail = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();

  const [form, setForm] = useState<FormSchema | null>(null);
  const [subFormName, setSubFormName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('personal_info');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load form on mount
  useEffect(() => {
    if (formId) {
      const loadedForm = storageService.getFormById(formId);
      if (loadedForm) {
        setForm(loadedForm);
      } else {
        navigate('/admin');
      }
    }
    setIsLoading(false);
  }, [formId, navigate]);

  const handleAddSubForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subFormName.trim()) {
      setError('Sub-form name is required');
      return;
    }

    if (!form) return;

    const newSubForm: SubForm = {
      id: Date.now().toString(),
      name: subFormName.trim(),
      category: selectedCategory,
      fields: [],
    };

    const updatedForm = {
      ...form,
      sub_forms: [...form.sub_forms, newSubForm],
    };

    storageService.saveForm(updatedForm);
    setForm(updatedForm);
    setSubFormName('');
    
    // Navigate to builder with the newly created sub-form
    navigate(`/admin/builder/${form.id}?subform=${newSubForm.id}`);
  };

  const handleDeleteSubForm = (subFormId: string) => {
    if (!form) return;

    if (confirm('Delete this sub-form?')) {
      const updatedForm = {
        ...form,
        sub_forms: form.sub_forms.filter(sf => sf.id !== subFormId),
      };

      storageService.saveForm(updatedForm);
      setForm(updatedForm);
    }
  };

  const handleEditSubForm = (subFormId: string) => {
    navigate(`/admin/builder/${form?.id}?subform=${subFormId}`);
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{form.name}</h1>
            <p className="text-slate-500 mt-2">Manage sub-forms and fields</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{form.sub_forms.length}</p>
            <p className="text-sm text-slate-500">Sub-forms</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Add sub-form form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Sub-Form</h2>
            <form onSubmit={handleAddSubForm} className="space-y-4">
              <div>
                <label htmlFor="subFormName" className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  id="subFormName"
                  type="text"
                  value={subFormName}
                  onChange={(e) => {
                    setSubFormName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., General Information"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sub-Form
              </button>
            </form>
          </div>
        </div>

        {/* Right: Sub-forms list */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">
                Sub-Forms
              </h2>
            </div>

            {form.sub_forms.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No sub-forms yet</p>
                <p className="text-slate-400 text-sm mt-1">Add your first sub-form to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {form.sub_forms.map((subForm, index) => (
                  <div
                    key={subForm.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{subForm.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {subForm.fields.length} field{subForm.fields.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditSubForm(subForm.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubForm(subForm.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
