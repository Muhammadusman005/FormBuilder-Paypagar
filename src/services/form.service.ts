import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface FormMetadata {
  id?: string;
  title: string;
  status: 'draft' | 'published';
  schema: any;
  version?: number;
}

export const FormService = {
  /**
   * Fetch all forms (Dashboard)
   */
  getAllForms: async () => {
    return api.get(API_ENDPOINTS.FORMS.GET_ALL);
  },

  /**
   * Fetch a single form schema by ID (Renderer/Builder)
   */
  getFormById: async (id: string) => {
    return api.get(API_ENDPOINTS.FORMS.GET_BY_ID(id));
  },

  /**
   * Create a new form (Builder)
   */
  createForm: async (data: FormMetadata) => {
    return api.post(API_ENDPOINTS.FORMS.CREATE, data);
  },

  /**
   * Update an existing form (Builder)
   */
  updateForm: async (id: string, data: FormMetadata) => {
    return api.put(API_ENDPOINTS.FORMS.UPDATE(id), data);
  },

  /**
   * Delete a form (Dashboard)
   */
  deleteForm: async (id: string) => {
    return api.delete(API_ENDPOINTS.FORMS.DELETE(id));
  },
};
