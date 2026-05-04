import type { FormSchema } from '../types/form';

const FORMS_STORAGE_KEY = 'forms_builder_data';
const CURRENT_FORM_KEY = 'current_form_editing';

export const storageService = {
  // Get all forms from localStorage
  getAllForms: (): FormSchema[] => {
    try {
      const data = localStorage.getItem(FORMS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading forms from storage:', error);
      return [];
    }
  },

  // Get a single form by ID
  getFormById: (id: string): FormSchema | null => {
    const forms = storageService.getAllForms();
    return forms.find(f => f.id === id) || null;
  },

  // Save a form (create or update)
  saveForm: (form: FormSchema): void => {
    try {
      const forms = storageService.getAllForms();
      const existingIndex = forms.findIndex(f => f.id === form.id);

      const formToSave = {
        ...form,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        forms[existingIndex] = formToSave;
      } else {
        forms.push(formToSave);
      }

      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));
    } catch (error) {
      console.error('Error saving form to storage:', error);
    }
  },

  // Delete a form
  deleteForm: (id: string): void => {
    try {
      const forms = storageService.getAllForms();
      const filtered = forms.filter(f => f.id !== id);
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting form from storage:', error);
    }
  },

  // Export form as JSON
  exportFormAsJson: (form: FormSchema): string => {
    return JSON.stringify(form, null, 2);
  },

  // Import form from JSON
  importFormFromJson: (jsonString: string): FormSchema | null => {
    try {
      const form = JSON.parse(jsonString);
      // Validate basic structure
      if (form.id && form.name && Array.isArray(form.sub_forms)) {
        return form as FormSchema;
      }
      return null;
    } catch (error) {
      console.error('Error importing form from JSON:', error);
      return null;
    }
  },

  // Set current form being edited
  setCurrentForm: (form: FormSchema): void => {
    try {
      localStorage.setItem(CURRENT_FORM_KEY, JSON.stringify(form));
    } catch (error) {
      console.error('Error setting current form:', error);
    }
  },

  // Get current form being edited
  getCurrentForm: (): FormSchema | null => {
    try {
      const data = localStorage.getItem(CURRENT_FORM_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading current form:', error);
      return null;
    }
  },

  // Clear current form
  clearCurrentForm: (): void => {
    try {
      localStorage.removeItem(CURRENT_FORM_KEY);
    } catch (error) {
      console.error('Error clearing current form:', error);
    }
  },
};
