/**
 * Centralized Form Utilities
 * 
 * Single file containing:
 * - ID generation
 * - Schema building
 * - Field validation (regex parsing, field validation, batch validation)
 * - All reusable form logic
 */

import type { FormField, FieldValidation } from '../types/form';

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

        if (field.type === 'dropdown' && field.options?.length) {
          base.choices = field.options;
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
 * Parses a regex string in either "/pattern/flags" or plain "pattern" format.
 *
 * Returns:
 *  - { re: RegExp }     → valid regex, use it
 *  - { error: string }  → invalid regex syntax, block the field
 *  - null               → no regex provided, skip check
 */
export function parseRegex(raw: string | undefined): { re: RegExp } | { error: string } | null {
  if (!raw || !raw.trim()) return null;

  try {
    const slashMatch = raw.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slashMatch) {
      return { re: new RegExp(slashMatch[1], slashMatch[2]) };
    }
    return { re: new RegExp(raw) };
  } catch (e: any) {
    return { error: e?.message ?? 'Invalid regex pattern' };
  }
}

/**
 * Returns true if the raw string is a syntactically valid regex.
 * Used for live feedback in the properties panel.
 */
export function isValidRegex(raw: string): boolean {
  const result = parseRegex(raw);
  if (result === null) return true; // empty = no restriction = valid
  return 're' in result;
}

/**
 * Validates a single field value against ALL configured validation rules.
 *
 * Each rule has its own dedicated message field so the correct message is
 * always shown regardless of which rule fires.
 *
 * Priority order (first failure wins):
 *   required → minLength → maxLength → regex
 *
 * Returns an error string if invalid, or null if all rules pass.
 */
export function validateField(field: FormField, value: string): string | null {
  const v = field.validation;

  // ── Required ────────────────────────────────────────────────────────────────
  if (field.required && !value.trim()) {
    return `${field.label} is required`;
  }

  // If empty and not required, no further checks needed
  if (!value.trim()) return null;

  // No validation config at all — allow everything
  if (!v) return null;

  // ── Text field validations ──────────────────────────────────────────────────
  if (field.type === 'text') {

    // Min length — uses its own message, falls back to default
    if (v.minLength !== undefined && value.length < v.minLength) {
      return v.minLengthMessage || `Minimum ${v.minLength} characters required`;
    }

    // Max length — uses its own message, falls back to default
    if (v.maxLength !== undefined && value.length > v.maxLength) {
      return v.maxLengthMessage || `Maximum ${v.maxLength} characters allowed`;
    }

    // Regex — strictly enforced, uses its own message
    // Falls back to legacy `validationMessage` for backward compatibility
    if (v.regex) {
      const parsed = parseRegex(v.regex);

      if (parsed === null) {
        // No regex — allow
      } else if ('error' in parsed) {
        // Admin saved a broken regex — block with a clear admin-facing note
        return `This field has an invalid regex pattern. Please contact the form admin.`;
      } else {
        // Valid regex — test strictly against the full value
        if (!parsed.re.test(value)) {
          return v.regexMessage || v.validationMessage || `Invalid format`;
        }
      }
    }
  }

  // ── Number field validations ────────────────────────────────────────────────
  if (field.type === 'number') {
    const num = Number(value);

    if (isNaN(num)) {
      return `${field.label} must be a valid number`;
    }

    if (v.min !== undefined && num < v.min) {
      return v.minMessage || `Minimum value is ${v.min}`;
    }

    if (v.max !== undefined && num > v.max) {
      return v.maxMessage || `Maximum value is ${v.max}`;
    }
  }

  return null;
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
