import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FormField, FormSchema, SubForm } from '../../types/form';
import { FieldPalette } from '../../components/FieldPalette';
import { FormCanvas } from '../../components/FormCanvas';
import { FormPreview } from '../../components/FormPreview';
import { FormJsonView } from '../../components/FormJsonView';
import { FieldPropertiesPanel } from '../../components/FieldPropertiesPanel';
import { SubFormManager } from '../../components/SubFormManager';
import { FIELD_COMPONENTS } from '../../components/FieldComponents';
import { storageService } from '../../services/storage.service';
import { Save, ArrowLeft, CheckCircle, Circle, Eye, Pencil, Braces, Menu } from 'lucide-react';

export const Builder = () => {
  const navigate = useNavigate();
  const { id: formId } = useParams<{ id?: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const subFormIdFromQuery = searchParams.get('subform');

  // Form state
  const [form, setForm] = useState<FormSchema | null>(null);
  const [selectedSubFormId, setSelectedSubFormId] = useState<string | null>(subFormIdFromQuery);
  const [showSubFormManager, setShowSubFormManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Field state
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'designer' | 'preview' | 'json'>('designer');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  // Load form on mount
  useEffect(() => {
    setIsLoading(true);
    if (formId) {
      // Add a small delay to ensure localStorage is ready
      const timer = setTimeout(() => {
        const loadedForm = storageService.getFormById(formId);
        if (loadedForm) {
          setForm(loadedForm);
          
          // Use sub-form from query parameter if available, otherwise use first sub-form
          let subFormToSelect = subFormIdFromQuery;
          if (!subFormToSelect && loadedForm.sub_forms.length > 0) {
            subFormToSelect = loadedForm.sub_forms[0].id;
          }
          
          if (subFormToSelect) {
            setSelectedSubFormId(subFormToSelect);
            const subForm = loadedForm.sub_forms.find(sf => sf.id === subFormToSelect);
            setFields(subForm?.fields || []);
          }
        } else {
          // Form not found, redirect to dashboard
          navigate('/');
        }
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [formId, subFormIdFromQuery, navigate]);

  // If no form is loaded, show loading state
  if (!form || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  // If form has no sub-forms, show error
  if (form.sub_forms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-4">No sub-forms found</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentSubForm = form.sub_forms.find(sf => sf.id === selectedSubFormId);

  const handleAddSubForm = (subForm: SubForm) => {
    const updatedForm = {
      ...form,
      sub_forms: [...form.sub_forms, subForm],
    };
    setForm(updatedForm);
    storageService.saveForm(updatedForm);
  };

  const handleDeleteSubForm = (subFormId: string) => {
    const updatedForm = {
      ...form,
      sub_forms: form.sub_forms.filter(sf => sf.id !== subFormId),
    };
    setForm(updatedForm);
    if (selectedSubFormId === subFormId) {
      setSelectedSubFormId(updatedForm.sub_forms[0]?.id || null);
      setFields(updatedForm.sub_forms[0]?.fields || []);
    }
    storageService.saveForm(updatedForm);
  };

  const handleSelectSubForm = (subFormId: string) => {
    setSelectedSubFormId(subFormId);
    const subForm = form.sub_forms.find(sf => sf.id === subFormId);
    setFields(subForm?.fields || []);
    setSelectedField(null);
  };

  const handleBackToDashboard = () => {
    // Save current sub-form fields before leaving
    if (currentSubForm) {
      const updatedSubForms = form.sub_forms.map(sf =>
        sf.id === selectedSubFormId ? { ...sf, fields } : sf
      );
      const updatedForm = { ...form, sub_forms: updatedSubForms };
      storageService.saveForm(updatedForm);
    }
    navigate('/');
  };

  // ── Palette drag ──────────────────────────────────────────────
  const handlePaletteDragStart = (componentType: string) => {
    setDraggedComponentType(componentType);
    setDraggedId(null);
  };

  // ── Canvas drop (new component from palette) ──────────────────
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponentType) return;

    const component = FIELD_COMPONENTS.find(c => c.type === draggedComponentType);
    if (component) {
      const newField = component.create();

      // Assign a unique row — always a new row below all existing fields
      const maxRow = fields.reduce((max, f) => Math.max(max, f.row ?? 0), -1);
      newField.row = maxRow + 1;
      newField.colSpan = 4; // default full width

      const updatedFields = [...fields, newField];
      setFields(updatedFields);
      setSelectedField(newField);

      // Update form
      if (currentSubForm) {
        const updatedSubForms = form.sub_forms.map(sf =>
          sf.id === selectedSubFormId ? { ...sf, fields: updatedFields } : sf
        );
        const updatedForm = { ...form, sub_forms: updatedSubForms };
        setForm(updatedForm);
      }
    }
    setDraggedComponentType(null);
  };

  // ── Field reorder / row merge drag ───────────────────────────
  const handleFieldDragStart = (id: string) => {
    setDraggedId(id);
    setDraggedComponentType(null);
  };

  const handleFieldsUpdate = (updatedFields: FormField[]) => {
    setFields(updatedFields);
    setDraggedId(null);

    // Sync to form state
    if (currentSubForm) {
      const updatedSubForms = form.sub_forms.map(sf =>
        sf.id === selectedSubFormId ? { ...sf, fields: updatedFields } : sf
      );
      const updatedForm = { ...form, sub_forms: updatedSubForms };
      setForm(updatedForm);
    }
  };

  // ── Field CRUD ────────────────────────────────────────────────
  const handleSelectField = (field: FormField) => {
    setSelectedField(field);
  };

  const handleUpdateField = (updated: FormField) => {
    const updatedFields = fields.map(f => f.id === updated.id ? updated : f);
    setFields(updatedFields);
    setSelectedField(updated);

    // Update form
    if (currentSubForm) {
      const updatedSubForms = form.sub_forms.map(sf =>
        sf.id === selectedSubFormId ? { ...sf, fields: updatedFields } : sf
      );
      const updatedForm = { ...form, sub_forms: updatedSubForms };
      setForm(updatedForm);
    }
  };

  const handleDeleteField = (id: string) => {
    const updatedFields = fields.filter(f => f.id !== id);
    setFields(updatedFields);
    if (selectedField?.id === id) setSelectedField(null);

    // Update form
    if (currentSubForm) {
      const updatedSubForms = form.sub_forms.map(sf =>
        sf.id === selectedSubFormId ? { ...sf, fields: updatedFields } : sf
      );
      const updatedForm = { ...form, sub_forms: updatedSubForms };
      setForm(updatedForm);
    }
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = () => {
    if (currentSubForm) {
      const updatedSubForms = form.sub_forms.map(sf =>
        sf.id === selectedSubFormId ? { ...sf, fields } : sf
      );
      const updatedForm = {
        ...form,
        sub_forms: updatedSubForms,
        status: form.status,
      };
      storageService.saveForm(updatedForm);
      setForm(updatedForm);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Preview ───────────────────────────────────────────────────
  const handlePreviewInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePreviewSubmit = () => {
    alert('Form submitted successfully!');
    setFormData({});
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBackToDashboard}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Form</p>
            <p className="text-base font-semibold text-slate-800">{form.name}</p>
          </div>
          {currentSubForm && (
            <>
              <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
              <button
                onClick={() => setShowSubFormManager(!showSubFormManager)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Menu className="w-3.5 h-3.5" />
                {currentSubForm.name}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Designer / Preview / JSON tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setActiveTab('designer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'designer'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" /> Designer
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'json'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Braces className="w-3.5 h-3.5" /> JSON
            </button>
          </div>

          {/* Status toggle */}
          <button
            onClick={() => {
              const newStatus: 'draft' | 'published' = form.status === 'draft' ? 'published' : 'draft';
              const updatedForm = { ...form, status: newStatus };
              setForm(updatedForm);
              storageService.saveForm(updatedForm);
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              form.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {form.status === 'published'
              ? <><CheckCircle className="w-3.5 h-3.5" /> Published</>
              : <><Circle className="w-3.5 h-3.5" /> Draft</>
            }
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              saved
                ? 'bg-emerald-500 text-white border border-emerald-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600'
            }`}
          >
            {saved
              ? <><CheckCircle className="w-3.5 h-3.5" /> Saved!</>
              : <><Save className="w-3.5 h-3.5" /> Save</>
            }
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Sub-form manager or palette */}
        {showSubFormManager ? (
          <div className="w-64 border-r border-slate-200 overflow-hidden">
            <SubFormManager
              form={form}
              selectedSubFormId={selectedSubFormId}
              onSelectSubForm={handleSelectSubForm}
              onAddSubForm={handleAddSubForm}
              onDeleteSubForm={handleDeleteSubForm}
              onBack={handleBackToDashboard}
            />
          </div>
        ) : (
          activeTab === 'designer' && <FieldPalette onDragStart={handlePaletteDragStart} />
        )}

        {/* Center/Right: Canvas or Preview */}
        {activeTab === 'designer' ? (
          <>
            {/* Canvas */}
            <FormCanvas
              title={currentSubForm?.name || 'Form'}
              fields={fields}
              selectedFieldId={selectedField?.id ?? null}
              draggedId={draggedId}
              onFieldDragStart={handleFieldDragStart}
              onFieldsUpdate={handleFieldsUpdate}
              onDelete={handleDeleteField}
              onSelect={handleSelectField}
              onCanvasDrop={handleCanvasDrop}
            />

            {/* Properties panel */}
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedField(null)}
              allFields={fields}
            />
          </>
        ) : activeTab === 'preview' ? (
          <FormPreview
            title={currentSubForm?.name || 'Form'}
            fields={fields}
            formData={formData}
            onInputChange={handlePreviewInputChange}
            onSubmit={handlePreviewSubmit}
          />
        ) : (
          <FormJsonView form={{
            ...form,
            sub_forms: form.sub_forms.map(sf =>
              sf.id === selectedSubFormId ? { ...sf, fields } : sf
            ),
          }} />
        )}
      </div>
    </div>
  );
};
