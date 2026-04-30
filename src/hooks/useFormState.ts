/**
 * useFormState
 *
 * Centralizes all runtime form state: field values, per-field errors,
 * file reset key, and submit logic.
 *
 * Used by FormPreview (builder tab) and SubmitForm (public page).
 */
import { useState, useCallback } from 'react';
import type { FormField } from '../types/form';
import { validateField, validateAllFields } from '../utils/form';

export interface UseFormStateReturn {
  formData:    Record<string, unknown>;
  errors:      Record<string, string | null>;
  fileResetKey: number;
  handleChange: (fieldId: string, value: unknown, field: FormField) => void;
  handleSubmit: (
    e: React.FormEvent,
    fields: FormField[],
    onSuccess: () => void
  ) => void;
  resetForm: () => void;
}

export function useFormState(): UseFormStateReturn {
  const [formData,     setFormData]     = useState<Record<string, unknown>>({});
  const [errors,       setErrors]       = useState<Record<string, string | null>>({});
  const [fileResetKey, setFileResetKey] = useState(0);

  /** Update a single field value and validate it immediately */
  const handleChange = useCallback(
    (fieldId: string, value: unknown, field: FormField) => {
      setFormData(prev => ({ ...prev, [fieldId]: value }));
      const err = validateField(field, String(value ?? ''));
      setErrors(prev => ({ ...prev, [fieldId]: err }));
    },
    []
  );

  /** Validate all fields; call onSuccess only when there are no errors */
  const handleSubmit = useCallback(
    (e: React.FormEvent, fields: FormField[], onSuccess: () => void) => {
      e.preventDefault();

      const newErrors = validateAllFields(
        fields,
        (id) => String(formData[id] ?? '')
      );

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(Boolean);
      if (hasError) return;

      onSuccess();
    },
    [formData]
  );

  /** Clear all state (e.g. after successful submission) */
  const resetForm = useCallback(() => {
    setFormData({});
    setErrors({});
    setFileResetKey(k => k + 1);
  }, []);

  return { formData, errors, fileResetKey, handleChange, handleSubmit, resetForm };
}
