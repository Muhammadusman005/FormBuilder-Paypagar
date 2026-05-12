/**
 * useFormSync
 *
 * Centralizes the most repeated pattern in the Builder:
 *   "update fields → sync to sub_forms array → update form state → optionally save"
 *
 * Also provides sub-form CRUD operations that were duplicated across
 * Builder.tsx, FormDetail.tsx, and SubFormSetup.tsx.
 */

import type { FormField, FormSchema, SubForm } from '../types/form';
import { storageService } from '../services/storage.service';

// ── Types ──────────────────────────────────────────────────────────────────

export interface FormSyncActions {
  /** Replace fields for the active sub-form and sync to form state */
  syncFields: (
    updatedFields: FormField[],
    options?: { save?: boolean }
  ) => void;

  /** Add a sub-form to the form */
  addSubForm: (subForm: SubForm, options?: { save?: boolean }) => void;

  /** Delete a sub-form from the form */
  deleteSubForm: (subFormId: string, options?: { save?: boolean }) => void;

  /** Save the current form state to storage */
  saveForm: () => void;

  /** Update the form status */
  setStatus: (status: 'draft' | 'published') => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * Returns a set of stable action functions that handle the form ↔ sub-form
 * sync pattern. Pass the current state values and their setters.
 *
 * Usage:
 *   const actions = useFormSync({ form, setForm, selectedSubFormId, fields, setFields });
 *   actions.syncFields(updatedFields);
 */
export function useFormSync(params: {
  form:               FormSchema | null;
  setForm:            (form: FormSchema) => void;
  selectedSubFormId:  string | null;
  fields:             FormField[];
  setFields:          (fields: FormField[]) => void;
}): FormSyncActions {
  const { form, setForm, selectedSubFormId, fields, setFields } = params;

  // ── syncFields ─────────────────────────────────────────────────
  const syncFields: FormSyncActions['syncFields'] = (updatedFields, options = {}) => {
    setFields(updatedFields);
    if (!form || !selectedSubFormId) return;

    const updatedSubForms = form.sub_forms.map(sf =>
      sf.id === selectedSubFormId ? { ...sf, fields: updatedFields } : sf
    );
    const updatedForm = { ...form, sub_forms: updatedSubForms };
    setForm(updatedForm);

    if (options.save) {
      storageService.saveForm(updatedForm);
    }
  };

  // ── addSubForm ─────────────────────────────────────────────────
  const addSubForm: FormSyncActions['addSubForm'] = (subForm, options = {}) => {
    if (!form) return;
    const updatedForm = { ...form, sub_forms: [...form.sub_forms, subForm] };
    setForm(updatedForm);
    if (options.save) storageService.saveForm(updatedForm);
  };

  // ── deleteSubForm ──────────────────────────────────────────────
  const deleteSubForm: FormSyncActions['deleteSubForm'] = (subFormId, options = {}) => {
    if (!form) return;
    const updatedForm = {
      ...form,
      sub_forms: form.sub_forms.filter(sf => sf.id !== subFormId),
    };
    setForm(updatedForm);
    if (options.save) storageService.saveForm(updatedForm);
  };

  // ── saveForm ───────────────────────────────────────────────────
  const saveForm: FormSyncActions['saveForm'] = () => {
    if (!form || !selectedSubFormId) return;
    const updatedSubForms = form.sub_forms.map(sf =>
      sf.id === selectedSubFormId ? { ...sf, fields } : sf
    );
    const updatedForm = { ...form, sub_forms: updatedSubForms };
    setForm(updatedForm);
    storageService.saveForm(updatedForm);
  };

  // ── setStatus ──────────────────────────────────────────────────
  const setStatus: FormSyncActions['setStatus'] = (status) => {
    if (!form) return;
    const updatedForm = { ...form, status };
    setForm(updatedForm);
    storageService.saveForm(updatedForm);
  };

  return { syncFields, addSubForm, deleteSubForm, saveForm, setStatus };
}
