const url = {
    local: import.meta.env.VITE_API_ENDPOINT_LOCAL,
    dev: import.meta.env.VITE_API_ENDPOINT_DEVELOPMENT,
    prod: import.meta.env.VITE_API_ENDPOINT_PRODUCTION,
} 


export const baseUrl = url.dev; 
export const ENDPOINTS = {
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

// Alias for backward compatibility
export const API_ENDPOINTS = ENDPOINTS;
