import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FormField, FormSchema } from '../../types/form';
import { FieldPalette } from '../../components/FieldPalette';
import { FormCanvas } from '../../components/FormCanvas';
import { FormPreview } from '../../components/FormPreview';
import { FormJsonView } from '../../components/FormJsonView';
import { FieldPropertiesPanel } from '../../components/FieldPropertiesPanel';
import { FIELD_COMPONENTS } from '../../components/FieldComponents';
import { Save, ArrowLeft, CheckCircle, Circle, Eye, Pencil, Braces } from 'lucide-react';

export const Builder = () => {
  const [title, setTitle] = useState('Untitled Form');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'designer' | 'preview' | 'json'>('designer');
  const [formData, setFormData] = useState<Record<string, any>>({});

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
      setFields(prev => [...prev, newField]);
      setSelectedField(newField);
    }
    setDraggedComponentType(null);
  };

  // ── Field reorder drag ────────────────────────────────────────
  const handleFieldDragStart = (id: string) => {
    setDraggedId(id);
    setDraggedComponentType(null);
  };

  const handleFieldDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setFields(prev => {
      const next = [...prev];
      const from = next.findIndex(f => f.id === draggedId);
      const to = next.findIndex(f => f.id === targetId);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  // ── Field CRUD ────────────────────────────────────────────────
  const handleSelectField = (field: FormField) => {
    setSelectedField(field);
  };

  const handleUpdateField = (updated: FormField) => {
    setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
    setSelectedField(updated);
  };

  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = () => {
    const schema: FormSchema = { id: Date.now().toString(), title, fields, status };
    console.log('Saving form...', schema);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Preview ───────────────────────────────────────────────────
  const handlePreviewInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        alert(`"${field.label}" is required`);
        return;
      }
    }
    alert('Form submitted successfully!');
    setFormData({});
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-semibold text-slate-800 bg-transparent border-none outline-none focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 rounded px-2 py-0.5 min-w-0 w-48 sm:w-64"
            placeholder="Form title..."
          />
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
            onClick={() => setStatus(s => s === 'draft' ? 'published' : 'draft')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {status === 'published'
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

      {/* ── Main 3-panel layout ── */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'designer' ? (
          <>
            {/* Left: Component palette */}
            <FieldPalette onDragStart={handlePaletteDragStart} />

            {/* Center: Canvas */}
            <FormCanvas
              title={title}
              fields={fields}
              selectedFieldId={selectedField?.id ?? null}
              draggedId={draggedId}
              onFieldDragStart={handleFieldDragStart}
              onFieldDrop={handleFieldDrop}
              onDelete={handleDeleteField}
              onSelect={handleSelectField}
              onCanvasDrop={handleCanvasDrop}
            />

            {/* Right: Properties panel */}
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedField(null)}
            />
          </>
        ) : activeTab === 'preview' ? (
          <FormPreview
            title={title}
            fields={fields}
            formData={formData}
            onInputChange={handlePreviewInputChange}
            onSubmit={handlePreviewSubmit}
          />
        ) : (
          <FormJsonView title={title} fields={fields} />
        )}
      </div>
    </div>
  );
};
