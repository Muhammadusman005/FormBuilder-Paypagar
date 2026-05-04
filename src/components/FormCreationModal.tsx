import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { FormSchema, SubForm } from '../types/form';

interface FormCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateForm: (form: FormSchema) => void;
}

export const FormCreationModal = ({ isOpen, onClose, onCreateForm }: FormCreationModalProps) => {
  const [formName, setFormName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formName.trim()) {
      setError('Form name is required');
      return;
    }

    const newForm: FormSchema = {
      id: Date.now().toString(),
      name: formName.trim(),
      sub_forms: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateForm(newForm);
    setFormName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Create New Form</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="formName" className="block text-sm font-medium text-slate-700 mb-2">
              Form Name
            </label>
            <input
              id="formName"
              type="text"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Customer Feedback, Employee Onboarding"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <p className="text-xs text-slate-500">
            You'll be able to add sub-forms and fields after creating the form.
          </p>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Form
          </button>
        </div>
      </div>
    </div>
  );
};
