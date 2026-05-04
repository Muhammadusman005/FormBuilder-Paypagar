import { useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';
import type { FormSchema, SubForm } from '../types/form';

interface SubFormManagerProps {
  form: FormSchema;
  selectedSubFormId: string | null;
  onSelectSubForm: (subFormId: string) => void;
  onAddSubForm: (subForm: SubForm) => void;
  onDeleteSubForm: (subFormId: string) => void;
  onBack: () => void;
}

export const SubFormManager = ({
  form,
  selectedSubFormId,
  onSelectSubForm,
  onAddSubForm,
  onDeleteSubForm,
  onBack,
}: SubFormManagerProps) => {
  const [showNewSubForm, setShowNewSubForm] = useState(false);
  const [newSubFormName, setNewSubFormName] = useState('');
  const [error, setError] = useState('');

  const handleAddSubForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newSubFormName.trim()) {
      setError('Sub-form name is required');
      return;
    }

    const newSubForm: SubForm = {
      id: Date.now().toString(),
      name: newSubFormName.trim(),
      fields: [],
    };

    onAddSubForm(newSubForm);
    setNewSubFormName('');
    setShowNewSubForm(false);
    onSelectSubForm(newSubForm.id);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-lg font-semibold text-slate-900">{form.name}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {form.sub_forms.length} sub-form{form.sub_forms.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Sub-forms list */}
      <div className="flex-1 overflow-y-auto">
        {form.sub_forms.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 text-sm mb-4">No sub-forms yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {form.sub_forms.map((subForm) => (
              <div
                key={subForm.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedSubFormId === subForm.id
                    ? 'bg-indigo-50 border-l-4 border-indigo-600'
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => onSelectSubForm(subForm.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{subForm.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {subForm.fields.length} field{subForm.fields.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {selectedSubFormId === subForm.id && (
                      <ChevronRight className="w-4 h-4 text-indigo-600" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${subForm.name}"?`)) {
                          onDeleteSubForm(subForm.id);
                        }
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add sub-form section */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        {!showNewSubForm ? (
          <button
            onClick={() => setShowNewSubForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sub-Form
          </button>
        ) : (
          <form onSubmit={handleAddSubForm} className="space-y-3">
            <input
              type="text"
              value={newSubFormName}
              onChange={(e) => {
                setNewSubFormName(e.target.value);
                setError('');
              }}
              placeholder="Sub-form name (e.g., General Information)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewSubForm(false);
                  setNewSubFormName('');
                  setError('');
                }}
                className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
