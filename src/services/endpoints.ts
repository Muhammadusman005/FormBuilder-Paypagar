export const API_ENDPOINTS = {
  FORMS: {
    BASE: '/api/forms',
    GET_ALL: '/api/forms',
    GET_BY_ID: (id: string) => `/api/forms/${id}`,
    CREATE: '/api/forms',
    UPDATE: (id: string) => `/api/forms/${id}`,
    DELETE: (id: string) => `/api/forms/${id}`,
  },
  SUBMISSIONS: {
    SUBMIT: (formId: string) => `/api/forms/${formId}/submissions`,
    GET_ALL: (formId: string) => `/api/forms/${formId}/submissions`,
  },
  LOGIN: '/users/v1/admin-login'
};
