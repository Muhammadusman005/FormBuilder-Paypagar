import api from './axios';
import { ENDPOINTS } from './endpoints';

export const SubmissionService = {
  submitForm: async (formId: string, data: any, version: number) => {
    return api.post(ENDPOINTS.SUBMISSIONS.SUBMIT(formId), { data, version });
  },

  getSubmissions: async (formId: string, page = 1, limit = 10) => {
    return api.get(ENDPOINTS.SUBMISSIONS.GET_ALL(formId), { params: { page, limit } });
  },
};
