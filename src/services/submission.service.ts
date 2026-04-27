import api from './api';
import { API_ENDPOINTS } from './endpoints';

export const SubmissionService = {
  /**
   * Submit form data (Public Renderer)
   */
  submitForm: async (formId: string, data: any, version: number) => {
    return api.post(API_ENDPOINTS.SUBMISSIONS.SUBMIT(formId), {
      data,
      version,
    });
  },

  /**
   * Fetch submissions for a specific form (Admin Analytics)
   */
  getSubmissions: async (formId: string, page = 1, limit = 10) => {
    return api.get(API_ENDPOINTS.SUBMISSIONS.GET_ALL(formId), {
      params: { page, limit },
    });
  },
};
