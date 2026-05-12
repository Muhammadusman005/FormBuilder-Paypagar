/**
 * Centralized Form Utilities
 * 
 * Single file containing:
 * - ID generation
 * - Schema building
 * - Field validation (uses validation-engine.ts)
 * - All reusable form logic
 */

import type { FormField, FieldValidation } from '../types/form';
import { validateFieldWithRules, fieldValidationToRules } from './validation-engine';

// ────────────────────────────────────────────────────────────────────────────
// ID Generation
// ────────────────────────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Schema Building
// ────────────────────────────────────────────────────────────────────────────

export const buildFormSchema = (title: string, fields: FormField[]) => ({
  pages: [
    {
      name: 'page1',
      title,
      elements: fields.map((field, index) => {
        const base: Record<string, unknown> = {
          type:       field.type,
          name:       `question${index + 1}`,
          title:      field.label,
          isRequired: field.required,
        };

        if (field.placeholder)                    base.placeholder = field.placeholder;
        if (field.colSpan && field.colSpan !== 4) base.colSpan     = field.colSpan;

        if ((field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && field.options?.length) {
          base.choices = field.options;
        }

        if (field.type === 'dual-input' && field.dualInputLabels) {
          base.dualInputLabels = field.dualInputLabels;
        }

        if (field.validation && Object.keys(field.validation).length > 0) {
          const v = field.validation;
          const validation: Record<string, unknown> = {};

          if (v.regex)                    validation.regex             = v.regex;
          if (v.regexMessage)             validation.regexMessage      = v.regexMessage;
          if (v.minLength !== undefined)  validation.minLength         = v.minLength;
          if (v.minLengthMessage)         validation.minLengthMessage  = v.minLengthMessage;
          if (v.maxLength !== undefined)  validation.maxLength         = v.maxLength;
          if (v.maxLengthMessage)         validation.maxLengthMessage  = v.maxLengthMessage;
          if (v.min !== undefined)        validation.min               = v.min;
          if (v.minMessage)               validation.minMessage        = v.minMessage;
          if (v.max !== undefined)        validation.max               = v.max;
          if (v.maxMessage)               validation.maxMessage        = v.maxMessage;

          if (Object.keys(validation).length > 0) base.validation = validation;
        }

        return base;
      }),
    },
  ],
});

// ────────────────────────────────────────────────────────────────────────────
// Validation Utilities
// ────────────────────────────────────────────────────────────────────────────

/**
 * Validates a single field value against ALL configured validation rules.
 *
 * Uses the rule-based validation engine for consistency.
 * Converts old FieldValidation format to new ValidationRules format.
 *
 * Returns an error string if invalid, or null if all rules pass.
 */
export function validateField(field: FormField, value: string): string | null {
  const rules = fieldValidationToRules(field.validation);
  rules.required = field.required;
  rules.requiredMessage = `${field.label} is required`;

  return validateFieldWithRules(value, rules, field);
}

/**
 * Validates every field in a form at once.
 *
 * @param fields   - The form field definitions
 * @param getValue - Callback that returns the current string value for a field id
 * @returns        A map of fieldId → error string | null
 */
export function validateAllFields(
  fields: FormField[],
  getValue: (fieldId: string) => string
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};
  for (const field of fields) {
    errors[field.id] = validateField(field, getValue(field.id));
  }
  return errors;
}


/**
 * Predefined Regex Pattern Helpers
 */

/**
 * Gets a predefined regex pattern by ID.
 * 
 * @param patternId - The pattern ID (e.g., 'email', 'cnic', 'phone-us')
 * @returns The regex pattern string, or null if not found
 */
export function getPredefinedPattern(patternId: string): string | null {
  const { REGEX_PATTERNS } = require('../constants');
  const pattern = REGEX_PATTERNS.find((p: any) => p.id === patternId);
  return pattern?.pattern ?? null;
}

/**
 * Gets all available predefined patterns.
 * Used for populating pattern selector in UI.
 */
export function getAllPredefinedPatterns() {
  const { REGEX_PATTERNS } = require('../constants');
  return REGEX_PATTERNS;
}
