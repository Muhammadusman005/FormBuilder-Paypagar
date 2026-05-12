/**
 * useFormLoader
 *
 * Handles the repeated "load form from storage by ID, redirect if not found"
 * pattern used in Builder.tsx, FormDetail.tsx, and SubFormSetup.tsx.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormSchema } from '../types/form';
import { storageService } from '../services/storage.service';

interface UseFormLoaderOptions {
  /** Route to redirect to when form is not found. Defaults to '/' */
  notFoundRedirect?: string;
  /** Delay in ms before loading (useful for localStorage race conditions). Defaults to 0 */
  delay?: number;
}

interface UseFormLoaderReturn {
  form:      FormSchema | null;
  setForm:   (form: FormSchema) => void;
  isLoading: boolean;
}

/**
 * Loads a form by ID from storage. Redirects if not found.
 *
 * Usage:
 *   const { form, setForm, isLoading } = useFormLoader(formId);
 */
export function useFormLoader(
  formId:  string | undefined,
  options: UseFormLoaderOptions = {},
): UseFormLoaderReturn {
  const { notFoundRedirect = '/', delay = 0 } = options;
  const navigate = useNavigate();

  const [form,      setForm]      = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if (!formId) {
      setIsLoading(false);
      return;
    }

    const load = () => {
      const loadedForm = storageService.getFormById(formId);
      if (loadedForm) {
        setForm(loadedForm);
      } else {
        navigate(notFoundRedirect);
      }
      setIsLoading(false);
    };

    if (delay > 0) {
      const timer = setTimeout(load, delay);
      return () => clearTimeout(timer);
    }

    load();
  }, [formId, notFoundRedirect, delay, navigate]);

  return { form, setForm, isLoading };
}
