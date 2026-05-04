import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, BarChart2, Clock, Download, Trash2, ChevronRight } from 'lucide-react';
import type { FormSchema } from '../../types/form';
import { FormCreationModal } from '../../components/FormCreationModal';
import { storageService } from '../../services/storage.service';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load forms from localStorage on mount
  useEffect(() => {
    const loadedForms = storageService.getAllForms();
    setForms(loadedForms);
  }, []);

  const handleCreateForm = (newForm: FormSchema) => {
    storageService.saveForm(newForm);
    setForms(prev => [...prev, newForm]);
    setShowCreateModal(false);
    // Navigate to form detail page to add sub-forms
    navigate(`/admin/form/${newForm.id}`);
  };

  const handleDeleteForm = (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      storageService.deleteForm(id);
      setForms(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleExportForm = (form: FormSchema) => {
    const json = storageService.exportFormAsJson(form);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Forms', value: forms.length.toString(), icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Published', value: forms.filter(f => f.status === 'published').length.toString(), icon: ChevronRight, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Drafts', value: forms.filter(f => f.status === 'draft').length.toString(), icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Sub-forms', value: forms.reduce((acc, f) => acc + f.sub_forms.length, 0).toString(), icon: BarChart2, color: 'bg-sky-50 text-sky-600' },
  ];
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Forms</h1>
          <p className="text-sm text-slate-500 mt-0.5">Build, manage and share your forms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Forms table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">All Forms</h2>
          <span className="text-xs text-slate-400">{forms.length} forms</span>
        </div>

        <div className="divide-y divide-slate-100">
          {forms.map((form) => (
            <div
              key={form.id}
              onClick={() => navigate(`/admin/form/${form.id}`)}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              {/* Left */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{form.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {form.sub_forms.length} sub-form{form.sub_forms.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Middle */}
              <div className="hidden md:flex items-center gap-6 mx-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{form.sub_forms.length}</p>
                  <p className="text-xs text-slate-400">Sub-forms</p>
                </div>
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                  form.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}>
                  {form.status === 'published' ? '● Published' : '○ Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportForm(form);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                  title="Export as JSON"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteForm(form.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state placeholder */}
        {forms.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No forms yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first form to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Form
            </button>
          </div>
        )}
      </div>

      {/* Form Creation Modal */}
      <FormCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateForm={handleCreateForm}
      />
    </div>
  );
};
