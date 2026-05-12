import { useEffect, useState, useCallback } from 'react';
import type { FormField, FieldValidation, FileType } from '../types/form';
import { X, Plus, Trash2, ShieldCheck, Zap, LayoutGrid, ChevronDown, ChevronRight, BookmarkPlus, Check } from 'lucide-react';
import { isValidRegexPattern } from '../utils/validation-engine';
import { COL_SPAN_OPTIONS, REGEX_PATTERNS, FIELD_TYPE_META, FILE_TYPE_OPTIONS } from '../constants';
import type { RegexPattern } from '../constants';
import { customPatternService } from '../services/customPattern.service';

interface Props {
  field: FormField | null;
  onUpdate: (field: FormField) => void;
  onUpdateMultiple?: (fields: FormField[]) => void;
  onClose: () => void;
  allFields?: FormField[]
}

// Collapsible section wrapper
const Section = ({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{icon}</span>}
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        }
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

export const FieldPropertiesPanel = ({ field, onUpdate, onUpdateMultiple, onClose, allFields = [] }: Props) => {
  // ── ALL hooks must be declared before any early return ────────
  const [label, setLabel] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(4);
  const [row, setRow] = useState<number>(0);
  const [validation, setValidation] = useState<FieldValidation>({});
  const [acceptedFileTypes, setAcceptedFileTypes] = useState<FileType[]>([]);

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setPlaceholder(field.placeholder || '');
      setRequired(field.required);
      setOptions(field.options || []);
      setColSpan(field.colSpan ?? 4);
      setRow(field.row ?? 0);
      setValidation(field.validation || {});
      setAcceptedFileTypes(field.acceptedFileTypes || []);
    }
  }, [field?.id]);

  const handleChange = useCallback((updates: Partial<FormField>) => {
    if (!field) return;
    const updated = { ...field, label, placeholder, required, options, colSpan, row, validation, acceptedFileTypes, ...updates };
    onUpdate(updated);
    if ('label' in updates) setLabel(updates.label!);
    if ('placeholder' in updates) setPlaceholder(updates.placeholder!);
    if ('required' in updates) setRequired(updates.required!);
    if ('options' in updates) setOptions(updates.options!);
    if ('colSpan' in updates) setColSpan(updates.colSpan!);
    if ('row' in updates) setRow(updates.row!);
    if ('validation' in updates) setValidation(updates.validation!);
    if ('acceptedFileTypes' in updates) setAcceptedFileTypes(updates.acceptedFileTypes!);
  }, [field, label, placeholder, required, options, colSpan, row, validation, acceptedFileTypes, onUpdate]);

  const handleValidationChange = useCallback((patch: Partial<FieldValidation>) => {
    const updated = { ...validation, ...patch };
    (Object.keys(updated) as (keyof FieldValidation)[]).forEach((k) => {
      if (updated[k] === undefined || updated[k] === '') delete updated[k];
    });
    handleChange({ validation: updated });
  }, [validation, handleChange]);

  const applyPreset = useCallback((spans: number[]) => {
    if (!onUpdateMultiple) return;
    const rowFields = allFields.filter(f => (f.row ?? 0) === row);
    const sorted = [...rowFields].sort(
      (a, b) => allFields.findIndex(x => x.id === a.id) - allFields.findIndex(x => x.id === b.id)
    );
    const updated = sorted.map((f, i) => ({
      ...f,
      colSpan: (spans[i] ?? spans[spans.length - 1]) as 1 | 2 | 3 | 4,
    }));
    onUpdateMultiple(updated);
  }, [onUpdateMultiple, allFields, row]);

  // ── Custom patterns state — MUST be before early return ───────
  const [customPatterns, setCustomPatterns] = useState<RegexPattern[]>(() =>
    customPatternService.getAll()
  );
  const [savePatternName, setSavePatternName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setCustomPatterns(customPatternService.getAll());
    setShowSaveInput(false);
    setSavePatternName('');
  }, [field?.id]);

  const handleSavePattern = useCallback(() => {
    if (!validation.regex || !isValidRegexPattern(validation.regex)) return;
    const saved = customPatternService.save({
      label: savePatternName.trim() || 'Custom Pattern',
      pattern: validation.regex,
      description: 'Custom saved pattern',
      example: validation.regexMessage || '',
    });
    setCustomPatterns(prev => [...prev, saved]);
    setShowSaveInput(false);
    setSavePatternName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [validation.regex, validation.regexMessage, savePatternName]);

  const handleDeleteCustomPattern = useCallback((id: string) => {
    customPatternService.delete(id);
    setCustomPatterns(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Early return AFTER all hooks ──────────────────────────────
  if (!field) {
    return (
      <div className="w-64 bg-white border-l border-slate-100 flex flex-col items-center justify-center flex-shrink-0 gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-xs text-slate-400 text-center px-6 leading-relaxed">
          Click any field on the canvas to edit its properties
        </p>
      </div>
    );
  }

  const meta = FIELD_TYPE_META[field.type];
  const rowFields = allFields.filter(f => (f.row ?? 0) === row);
  const hasMultipleInRow = rowFields.length >= 2;
  const hasValidation = Object.keys(validation).length > 0;

  const addOption = () => handleChange({ options: [...options, `Option ${options.length + 1}`] });
  const updateOption = (i: number, v: string) => handleChange({ options: options.map((o, j) => j === i ? v : o) });
  const removeOption = (i: number) => handleChange({ options: options.filter((_, j) => j !== i) });

  return (
    <div className="w-64 bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex items-center justify-center w-6 h-6 rounded-md border flex-shrink-0 ${meta.color}`}>
            <meta.icon className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{label || 'Untitled'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{meta.label} field</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">

        {/* ── Basic ── */}
        <Section title="Basic">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleChange({ label: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Field label"
            />
          </div>

          {field.type !== 'file' && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Placeholder</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => handleChange({ placeholder: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Hint text..."
              />
            </div>
          )}

          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="text-xs font-medium text-slate-700">Required</p>
              <p className="text-[10px] text-slate-400">Must be filled before submit</p>
            </div>
            <button
              onClick={() => handleChange({ required: !required })}
              className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${required ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${required ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </Section>

        {/* ── Width ── */}
        <Section title="Width">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className={`h-1.5 rounded-full transition-colors ${col <= colSpan ? 'bg-indigo-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {COL_SPAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange({ colSpan: opt.value })}
                title={opt.desc}
                className={`py-1.5 text-xs font-semibold rounded-md border transition-all ${colSpan === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            {COL_SPAN_OPTIONS.find(o => o.value === colSpan)?.desc} — {colSpan}/4 columns
          </p>
        </Section>

        {/* ── Row Layout Presets ── */}
        <Section
          title="Row Layout"
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
          defaultOpen={false}
          badge={hasMultipleInRow ? `${rowFields.length} fields` : undefined}
        >
          <p className="text-[10px] text-slate-400 -mt-1">
            {hasMultipleInRow
              ? `Applies to all ${rowFields.length} fields in this row`
              : 'Drag another field onto this one to share a row'}
          </p>
          <div className="space-y-1">
            {[
              { label: 'Full width', bars: [4], spans: [4] },
              { label: '½ + ½', bars: [2, 2], spans: [2, 2] },
              { label: '⅓ + ⅔', bars: [1, 3], spans: [1, 3] },
              { label: '⅔ + ⅓', bars: [3, 1], spans: [3, 1] },
              { label: '⅓ + ⅓ + ⅓', bars: [1, 1, 1], spans: [1, 1, 1] },
            ].map(({ label: lbl, bars, spans }) => (
              <button
                key={lbl}
                onClick={() => applyPreset(spans)}
                disabled={!hasMultipleInRow && spans.length > 1}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${!hasMultipleInRow && spans.length > 1
                  ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
              >
                <div className="flex gap-0.5 flex-1 h-3">
                  {bars.map((flex, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${i === 0 ? 'bg-indigo-500' : 'bg-indigo-200'}`}
                      style={{ flex }}
                    />
                  ))}
                </div>
                <span className="text-slate-600 font-medium whitespace-nowrap">{lbl}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Options (Dropdown / Radio / Checkbox) ── */}
        {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
          <Section title="Options" badge={`${options.length}`}>
            <div className="space-y-1.5">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeOption(i)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
          </Section>
        )}

        {/* ── File Types (File Upload) ── */}
        {field.type === 'file' && (
          <Section title="Accepted File Type" badge={acceptedFileTypes[0] ? acceptedFileTypes[0].toUpperCase() : 'None'}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {FILE_TYPE_OPTIONS.map((fileType) => (
                  <button
                    key={fileType.value}
                    onClick={() => {
                      handleChange({ acceptedFileTypes: [fileType.value as FileType] });
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${acceptedFileTypes[0] === fileType.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                  >
                    {fileType.label}
                  </button>
                ))}
              </div>
              {acceptedFileTypes.length > 0 && (
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-[10px] text-indigo-700 font-medium">
                    ✓ Only <span className="font-bold">{acceptedFileTypes[0].toUpperCase()}</span> files allowed
                  </p>
                  <p className="text-[10px] text-indigo-600 mt-1">
                    Users will see an error if they try to upload other formats
                  </p>
                </div>
              )}
              {acceptedFileTypes.length === 0 && (
                <p className="text-[10px] text-slate-400 italic">Select a file type</p>
              )}
            </div>
          </Section>
        )}

        {/* ── Validation ── */}
        {(field.type === 'text' || field.type === 'number') && (
          <Section
            title="Validation"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            defaultOpen={hasValidation}
            badge={hasValidation ? 'Active' : undefined}
          >
            {field.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Quick Patterns
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const allP = [...REGEX_PATTERNS, ...customPatterns];
                        const p = allP.find(x => x.id === e.target.value);
                        if (p) {
                          handleValidationChange({ regex: p.pattern, regexMessage: `Must match ${p.label.toLowerCase()}` });
                          e.target.value = '';
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select a pattern…</option>
                    <optgroup label="Built-in">
                      {REGEX_PATTERNS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label} — {p.example}</option>
                      ))}
                    </optgroup>
                    {customPatterns.length > 0 && (
                      <optgroup label="My Saved Patterns">
                        {customPatterns.map((p) => (
                          <option key={p.id} value={p.id}>⭐ {p.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {/* Saved custom patterns list */}
                  {customPatterns.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Saved patterns</p>
                      {customPatterns.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-100 rounded-md">
                          <span className="text-[10px] text-amber-700 font-medium flex-1 truncate">{p.label}</span>
                          <button
                            onClick={() => handleValidationChange({ regex: p.pattern, regexMessage: `Must match ${p.label.toLowerCase()}` })}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => handleDeleteCustomPattern(p.id)}
                            className="p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Min length</label>
                    <input
                      type="number" min={0}
                      value={validation.minLength ?? ''}
                      onChange={(e) => handleValidationChange({ minLength: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Max length</label>
                    <input
                      type="number" min={0}
                      value={validation.maxLength ?? ''}
                      onChange={(e) => handleValidationChange({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {validation.minLength !== undefined && (
                  <input type="text" value={validation.minLengthMessage || ''}
                    onChange={(e) => handleValidationChange({ minLengthMessage: e.target.value || undefined })}
                    placeholder="Min length error message"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {validation.maxLength !== undefined && (
                  <input type="text" value={validation.maxLengthMessage || ''}
                    onChange={(e) => handleValidationChange({ maxLengthMessage: e.target.value || undefined })}
                    placeholder="Max length error message"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Regex Pattern</label>
                  <input
                    type="text"
                    value={validation.regex || ''}
                    onChange={(e) => handleValidationChange({ regex: e.target.value || undefined })}
                    placeholder="/^[A-Z].*$/"
                    className={`w-full px-2.5 py-1.5 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validation.regex
                      ? isValidRegexPattern(validation.regex) ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50'
                      : 'border-slate-200'
                      }`}
                  />
                  {validation.regex && (
                    isValidRegexPattern(validation.regex)
                      ? <p className="text-[10px] text-emerald-600 mt-0.5">✓ Valid pattern</p>
                      : <p className="text-[10px] text-red-500 mt-0.5">✗ Invalid regex</p>
                  )}
                  {validation.regex && isValidRegexPattern(validation.regex) && (
                    <input type="text" value={validation.regexMessage || ''}
                      onChange={(e) => handleValidationChange({ regexMessage: e.target.value || undefined })}
                      placeholder="Error message for this pattern"
                      className="w-full mt-1.5 px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}

                  {/* ── Save to Quick Patterns ── */}
                  {validation.regex && isValidRegexPattern(validation.regex) && (
                    <div className="mt-2">
                      {!showSaveInput ? (
                        <button
                          onClick={() => setShowSaveInput(true)}
                          className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${justSaved
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-dashed border-amber-300 text-amber-700 hover:bg-amber-50'
                            }`}
                        >
                          {justSaved
                            ? <><Check className="w-3 h-3" /> Saved!</>
                            : <><BookmarkPlus className="w-3 h-3" /> Save to Quick Patterns</>
                          }
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={savePatternName}
                            onChange={(e) => setSavePatternName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePattern();
                              if (e.key === 'Escape') { setShowSaveInput(false); setSavePatternName(''); }
                            }}
                            placeholder="Pattern name (e.g. CNIC Format)"
                            autoFocus
                            className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/50"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={handleSavePattern}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                              <BookmarkPlus className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => { setShowSaveInput(false); setSavePatternName(''); }}
                              className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {field.type === 'number' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Min value</label>
                    <input
                      type="number"
                      value={validation.min ?? ''}
                      onChange={(e) => handleValidationChange({ min: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Max value</label>
                    <input
                      type="number"
                      value={validation.max ?? ''}
                      onChange={(e) => handleValidationChange({ max: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {validation.min !== undefined && (
                  <input type="text" value={validation.minMessage || ''}
                    onChange={(e) => handleValidationChange({ minMessage: e.target.value || undefined })}
                    placeholder="Min value error message"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {validation.max !== undefined && (
                  <input type="text" value={validation.maxMessage || ''}
                    onChange={(e) => handleValidationChange({ maxMessage: e.target.value || undefined })}
                    placeholder="Max value error message"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            )}
          </Section>
        )}

      </div>
    </div>
  );
};
