import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, ArrowLeft, ChevronRight, Tag } from 'lucide-react';
import type { FormSchema, SubForm } from '../../types/form';
import { storageService } from '../../services/storage.service';

const SUB_FORM_CATEGORIES = [
  { id: 'personal_info', label: 'Personal Information', icon: '👤' },
  { id: 'business_info', label: 'Business Details', icon: '🏢' },
  { id: 'kyc', label: 'KYC / Verification', icon: '✓' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'financial', label: 'Financial Info', icon: '💰' },
  { id: 'contact', label: 'Contact Details', icon: '📞' },
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'other', label: 'Other', icon: '📋' },
];

export const SubFormSetup = () => {
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
        navigate('/');
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
    setSelectedCategory('personal_info');
  };

  const handleDeleteSubForm = (subFormId: string) => {
    if (!form) return;

    const updatedForm = {
      ...form,
      sub_forms: form.sub_forms.filter(sf => sf.id !== subFormId),
    };

    storageService.saveForm(updatedForm);
    setForm(updatedForm);
  };

  const handleStartBuilding = () => {
    if (!form || form.sub_forms.length === 0) {
      setError('Please create at least one sub-form');
      return;
    }
    navigate(`/admin/builder/${form.id}`);
  };

  const getCategoryLabel = (categoryId?: string) => {
    return SUB_FORM_CATEGORIES.find(c => c.id === categoryId)?.label || 'Other';
  };

  const getCategoryIcon = (categoryId?: string) => {
    return SUB_FORM_CATEGORIES.find(c => c.id === categoryId)?.icon || '📋';
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-slate-900">{form.name}</h1>
        <p className="text-slate-500 mt-2">Create sub-forms for your main form</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add sub-form form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Sub-Form</h2>
            <form onSubmit={handleAddSubForm} className="space-y-4">
              {/* Sub-form name */}
              <div>
                <label htmlFor="subFormName" className="block text-sm font-medium text-slate-700 mb-2">
                  Sub-Form Name
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Category
                  </div>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {SUB_FORM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
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

            {/* Quick templates */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-3 font-medium">Quick Templates:</p>
              <div className="space-y-2">
                {SUB_FORM_CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSubFormName(cat.label);
                      setSelectedCategory(cat.id);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sub-forms list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">
                Sub-Forms ({form.sub_forms.length})
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {form.sub_forms.length === 0
                  ? 'Create at least one sub-form to continue'
                  : 'Click "Start Building" when ready'}
              </p>
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
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{subForm.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{getCategoryIcon(subForm.category)}</span>
                          <p className="text-xs text-slate-500">
                            {getCategoryLabel(subForm.category)} • {subForm.fields.length} field{subForm.fields.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubForm(subForm.id)}
                      className="flex-shrink-0 p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Building Button */}
          {form.sub_forms.length > 0 && (
            <button
              onClick={handleStartBuilding}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Start Building
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
