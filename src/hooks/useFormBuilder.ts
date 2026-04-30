/**
 * useFormBuilder
 *
 * Centralized form builder state management.
 * Handles field CRUD, reordering, selection, and form metadata.
 *
 * Usage:
 *   const {
 *     title, setTitle,
 *     status, setStatus,
 *     fields, selectedField,
 *     addField, updateField, deleteField, reorderFields,
 *     selectField, clearSelection
 *   } = useFormBuilder();
 */
import { useState, useCallback } from 'react';
import type { FormField, FormSchema } from '../types/form';

export interface UseFormBuilderReturn {
  // Metadata
  title: string;
  setTitle: (title: string) => void;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;

  // Fields
  fields: FormField[];
  selectedField: FormField | null;

  // Field operations
  addField: (field: FormField) => void;
  updateField: (field: FormField) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (fromId: string, toId: string) => void;

  // Selection
  selectField: (field: FormField) => void;
  clearSelection: () => void;

  // Export
  getSchema: () => FormSchema;
}

export function useFormBuilder(initialTitle = 'Untitled Form'): UseFormBuilderReturn {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const addField = useCallback((field: FormField) => {
    setFields(prev => [...prev, field]);
    setSelectedField(field);
  }, []);

  const updateField = useCallback((field: FormField) => {
    setFields(prev => prev.map(f => f.id === field.id ? field : f));
    setSelectedField(field);
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  }, [selectedField]);

  const reorderFields = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;

    setFields(prev => {
      const next = [...prev];
      const fromIndex = next.findIndex(f => f.id === fromId);
      const toIndex = next.findIndex(f => f.id === toId);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const selectField = useCallback((field: FormField) => {
    setSelectedField(field);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedField(null);
  }, []);

  const getSchema = useCallback((): FormSchema => ({
    id: Date.now().toString(),
    title,
    fields,
    status,
  }), [title, fields, status]);

  return {
    title,
    setTitle,
    status,
    setStatus,
    fields,
    selectedField,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    clearSelection,
    getSchema,
  };
}
