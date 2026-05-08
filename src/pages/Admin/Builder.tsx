import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FormField, SubForm } from '../../types/form';
import { FieldPalette }        from '../../components/FieldPalette';
import { FormCanvas }          from '../../components/FormCanvas';
import { FormPreview }         from '../../components/FormPreview';
import { FormJsonView }        from '../../components/FormJsonView';
import { FieldPropertiesPanel } from '../../components/FieldPropertiesPanel';
import { SubFormManager }      from '../../components/SubFormManager';
import { FIELD_COMPONENTS }    from '../../components/FieldComponents';
import { useFormLoader, useFormSync } from '../../hooks';
import { insertFieldIntoRow, insertFieldAsNewRow, nextRowIndex } from '../../utils/fieldLayout';
import { Save, ArrowLeft, CheckCircle, Circle, Eye, Pencil, Braces, Menu } from 'lucide-react';

export const Builder = () => {
  const navigate = useNavigate();
  const { id: formId } = useParams<{ id?: string }>();
  const subFormIdFromQuery = new URLSearchParams(window.location.search).get('subform');

  // ── Form loading ───────────────────────────────────────────────
  const { form, setForm, isLoading } = useFormLoader(formId, { delay: 100 });

  // ── Local state ────────────────────────────────────────────────
  const [selectedSubFormId, setSelectedSubFormId] = useState<string | null>(subFormIdFromQuery);
  const [showSubFormManager, setShowSubFormManager] = useState(false);
  const [fields,        setFields]        = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedId,     setDraggedId]     = useState<string | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<'designer' | 'preview' | 'json'>('designer');
  const [formData,      setFormData]      = useState<Record<string, unknown>>({});
  const [saved,         setSaved]         = useState(false);

  // ── Sync sub-form fields when form loads ───────────────────────
  useEffect(() => {
    if (!form) return;
    let subFormId = selectedSubFormId;
    if (!subFormId && form.sub_forms.length > 0) {
      subFormId = form.sub_forms[0].id;
      setSelectedSubFormId(subFormId);
    }
    if (subFormId) {
      const subForm = form.sub_forms.find(sf => sf.id === subFormId);
      setFields(subForm?.fields || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.id]);

  // ── Generic form sync actions ──────────────────────────────────
  const { syncFields, addSubForm, deleteSubForm, saveForm, setStatus } = useFormSync({
    form, setForm, selectedSubFormId, fields, setFields,
  });

  // ── Ctrl+S shortcut (before early returns — Rules of Hooks) ───
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveForm();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveForm]);

  // ── Palette click-to-add (before early returns) ────────────────
  const handlePaletteAddField = useCallback((componentType: string) => {
    const component = FIELD_COMPONENTS.find(c => c.type === componentType);
    if (!component) return;
    const newField = component.create();
    newField.row     = nextRowIndex(fields);
    newField.colSpan = 4;
    const updated = [...fields, newField];
    syncFields(updated);
    setSelectedField(newField);
  }, [fields, syncFields]);

  // ── Loading / error states ─────────────────────────────────────
  if (!form || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (form.sub_forms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-4">No sub-forms found</p>
          <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentSubForm = form.sub_forms.find(sf => sf.id === selectedSubFormId);

  // ── Sub-form management ────────────────────────────────────────
  const handleAddSubForm = (subForm: SubForm) => {
    addSubForm(subForm, { save: true });
  };

  const handleDeleteSubForm = (subFormId: string) => {
    deleteSubForm(subFormId, { save: true });
    if (selectedSubFormId === subFormId) {
      const remaining = form.sub_forms.filter(sf => sf.id !== subFormId);
      setSelectedSubFormId(remaining[0]?.id || null);
      setFields(remaining[0]?.fields || []);
    }
  };

  const handleSelectSubForm = (subFormId: string) => {
    setSelectedSubFormId(subFormId);
    const subForm = form.sub_forms.find(sf => sf.id === subFormId);
    setFields(subForm?.fields || []);
    setSelectedField(null);
  };

  const handleBackToDashboard = () => {
    saveForm();
    navigate('/');
  };

  // ── Palette drag ───────────────────────────────────────────────
  const handlePaletteDragStart = (componentType: string) => {
    setDraggedComponentType(componentType);
    setDraggedId(null);
  };

  // ── Canvas drop — empty canvas / bottom ───────────────────────
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponentType) return;
    const component = FIELD_COMPONENTS.find(c => c.type === draggedComponentType);
    if (component) {
      const newField   = component.create();
      newField.row     = nextRowIndex(fields);
      newField.colSpan = 4;
      const updated    = [...fields, newField];
      syncFields(updated);
      setSelectedField(newField);
    }
    setDraggedComponentType(null);
    setDraggedId(null);
  };

  // ── Canvas drop into specific row slot ────────────────────────
  const handleCanvasDropIntoRow = (e: React.DragEvent, targetRow: number, insertAtIndex: number) => {
    e.preventDefault();
    if (!draggedComponentType) return;
    const component = FIELD_COMPONENTS.find(c => c.type === draggedComponentType);
    if (!component) { setDraggedComponentType(null); return; }

    const newField = component.create();

    const updated = insertAtIndex === -1
      ? insertFieldAsNewRow(fields, newField, targetRow)
      : insertFieldIntoRow(fields, newField, targetRow, insertAtIndex);

    syncFields(updated);
    setSelectedField(newField);
    setDraggedComponentType(null);
    setDraggedId(null);
  };

  // ── Field drag ─────────────────────────────────────────────────
  const handleFieldDragStart = (id: string) => {
    setDraggedId(id);
    setDraggedComponentType(null);
  };

  const handleFieldDragEnd = () => setDraggedId(null);

  const handleFieldsUpdate = (updatedFields: FormField[]) => {
    syncFields(updatedFields);
    setDraggedId(null);
    setDraggedComponentType(null);
  };

  // ── Field CRUD ─────────────────────────────────────────────────
  const handleSelectField = (field: FormField) => setSelectedField(field);

  const handleUpdateField = (updated: FormField) => {
    const updatedFields = fields.map(f => f.id === updated.id ? updated : f);
    syncFields(updatedFields);
    setSelectedField(updated);
  };

  const handleDeleteField = (id: string) => {
    const updatedFields = fields.filter(f => f.id !== id);
    syncFields(updatedFields);
    if (selectedField?.id === id) setSelectedField(null);
  };

  // ── Save ───────────────────────────────────────────────────────
  const handleSave = () => {
    saveForm();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Preview ────────────────────────────────────────────────────
  const handlePreviewInputChange = (fieldId: string, value: unknown) =>
    setFormData(prev => ({ ...prev, [fieldId]: value }));

  const handlePreviewSubmit = () => {
    alert('Form submitted successfully!');
    setFormData({});
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleBackToDashboard} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0">
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
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {(['designer', 'preview', 'json'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'designer' && <><Pencil className="w-3.5 h-3.5" /> Designer</>}
                {tab === 'preview'  && <><Eye    className="w-3.5 h-3.5" /> Preview</>}
                {tab === 'json'     && <><Braces className="w-3.5 h-3.5" /> JSON</>}
              </button>
            ))}
          </div>

          {/* Status */}
          <button
            onClick={() => setStatus(form.status === 'draft' ? 'published' : 'draft')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              form.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {form.status === 'published'
              ? <><CheckCircle className="w-3.5 h-3.5" /> Published</>
              : <><Circle      className="w-3.5 h-3.5" /> Draft</>
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
              : <><Save        className="w-3.5 h-3.5" /> Save</>
            }
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 overflow-hidden flex">
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
          activeTab === 'designer' && (
            <FieldPalette onDragStart={handlePaletteDragStart} onAddField={handlePaletteAddField} />
          )
        )}

        {activeTab === 'designer' ? (
          <>
            <FormCanvas
              title={currentSubForm?.name || 'Form'}
              fields={fields}
              selectedFieldId={selectedField?.id ?? null}
              draggedId={draggedId}
              draggedComponentType={draggedComponentType}
              onFieldDragStart={handleFieldDragStart}
              onFieldDragEnd={handleFieldDragEnd}
              onFieldsUpdate={handleFieldsUpdate}
              onDelete={handleDeleteField}
              onSelect={handleSelectField}
              onCanvasDrop={handleCanvasDrop}
              onCanvasDropIntoRow={handleCanvasDropIntoRow}
            />
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={handleUpdateField}
              onUpdateMultiple={(updatedFields) => {
                const merged = fields.map(f => updatedFields.find(u => u.id === f.id) ?? f);
                syncFields(merged);
                if (selectedField) {
                  const updated = updatedFields.find(u => u.id === selectedField.id);
                  if (updated) setSelectedField(updated);
                }
              }}
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
