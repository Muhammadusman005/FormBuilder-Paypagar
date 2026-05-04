/**
 * Rule-Based Validation Engine
 * 
 * Centralized validation system supporting:
 * - Regex patterns (predefined + custom)
 * - Rule-based logic (required, min/max, length, etc.)
 * - Multiple field types (text, email, CNIC, passport, phone, etc.)
 * - Conditional validation
 * - Custom error messages
 */

import type { FormField, FieldValidation } from '../types/form';

// ────────────────────────────────────────────────────────────────────────────
// Regex Pattern Registry
// ────────────────────────────────────────────────────────────────────────────

export interface RegexPatternDef {
  id: string;
  pattern: RegExp;
  description: string;
}

const REGEX_REGISTRY: Record<string, RegExp> = {
  // Email & Communication
  email:        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'phone-us':   /^\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/,
  'phone-intl': /^\+?[1-9]\d{1,14}$/,

  // Pakistan-specific
  cnic:         /^\d{5}-\d{7}-\d{1}$/,
  'cnic-new':   /^\d{5}-\d{7}-\d{1}$/, // Same format
  ntn:          /^\d{7}-\d{1}$/,

  // Passport & ID
  passport:     /^[A-Z]{1,2}\d{6,9}$/,
  'passport-pk': /^[A-Z]{2}\d{7}$/,

  // Web & URLs
  url:          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ipv4:         /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  // User Credentials
  username:     /^[a-zA-Z0-9_-]{3,16}$/,
  'password-strong': /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Financial
  'credit-card': /^\d{13,19}$/,
  'zipcode-us': /^\d{5}(-\d{4})?$/,

  // Date & Time
  'date-iso':   /^\d{4}-\d{2}-\d{2}$/,
  'time-24h':   /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,

  // Text Constraints
  alphanumeric: /^[a-zA-Z0-9]+$/,
  'no-spaces':  /^\S+$/,
  'uppercase-only': /^[A-Z]+$/,
  'lowercase-only': /^[a-z]+$/,
  'name':       /^[A-Z][a-zA-Z ]+$/,
  'number':     /^\d+$/,
};

// ────────────────────────────────────────────────────────────────────────────
// Validation Rules Interface
// ────────────────────────────────────────────────────────────────────────────

export interface ValidationRules {
  required?: boolean;
  requiredMessage?: string;

  // Text length
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;

  // Number range
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;

  // Pattern matching
  pattern?: string; // Pattern ID or 'custom'
  customRegex?: string; // For custom patterns
  patternMessage?: string;

  // Conditional
  conditional?: (value: string, field: FormField) => boolean;
  conditionalMessage?: string;

  // Custom validator
  custom?: (value: string) => string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Core Validation Functions
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get regex pattern by ID or custom pattern
 */
export function getRegex(patternId: string, customRegex?: string): RegExp | null {
  // Custom regex takes precedence
  if (patternId === 'custom' && customRegex) {
    try {
      const slashMatch = customRegex.match(/^\/(.+)\/([gimsuy]*)$/);
      if (slashMatch) {
        return new RegExp(slashMatch[1], slashMatch[2]);
      }
      return new RegExp(customRegex);
    } catch (e) {
      return null;
    }
  }

  // Predefined pattern
  return REGEX_REGISTRY[patternId] ?? null;
}

/**
 * Validate a single field against rules
 * 
 * Priority order:
 * 1. Required check
 * 2. Length validations (min/max)
 * 3. Pattern matching
 * 4. Number range (min/max)
 * 5. Conditional validation
 * 6. Custom validator
 */
export function validateFieldWithRules(
  value: string,
  rules: ValidationRules,
  field?: FormField
): string | null {
  // 1. Required
  if (rules.required && !value.trim()) {
    return rules.requiredMessage || 'This field is required';
  }

  // If empty and not required, skip further checks
  if (!value.trim()) return null;

  // 2. Min/Max Length (text fields)
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
  }

  // 3. Pattern Matching
  if (rules.pattern) {
    const regex = getRegex(rules.pattern, rules.customRegex);
    if (regex && !regex.test(value)) {
      return rules.patternMessage || `Invalid format for ${rules.pattern}`;
    }
  }

  // 4. Number Range (for number fields)
  if (rules.min !== undefined || rules.max !== undefined) {
    const num = Number(value);
    if (!isNaN(num)) {
      if (rules.min !== undefined && num < rules.min) {
        return rules.minMessage || `Minimum value is ${rules.min}`;
      }
      if (rules.max !== undefined && num > rules.max) {
        return rules.maxMessage || `Maximum value is ${rules.max}`;
      }
    }
  }

  // 5. Conditional Validation
  if (rules.conditional && field) {
    if (!rules.conditional(value, field)) {
      return rules.conditionalMessage || 'This field does not meet the conditions';
    }
  }

  // 6. Custom Validator
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }

  return null;
}

/**
 * Validate all fields in a form
 */
export function validateAllFieldsWithRules(
  fields: FormField[],
  formData: Record<string, string>,
  rulesMap: Record<string, ValidationRules>
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};

  for (const field of fields) {
    const rules = rulesMap[field.id];
    if (!rules) continue;

    const value = formData[field.id] ?? '';
    errors[field.id] = validateFieldWithRules(value, rules, field);
  }

  return errors;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────────────────

/**
 * Check if a regex pattern is valid
 */
export function isValidRegexPattern(pattern: string): boolean {
  try {
    const slashMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slashMatch) {
      new RegExp(slashMatch[1], slashMatch[2]);
    } else {
      new RegExp(pattern);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all available regex patterns
 */
export function getAllRegexPatterns(): RegexPatternDef[] {
  return Object.entries(REGEX_REGISTRY).map(([id, pattern]) => ({
    id,
    pattern,
    description: getPatternDescription(id),
  }));
}

/**
 * Get description for a pattern
 */
function getPatternDescription(patternId: string): string {
  const descriptions: Record<string, string> = {
    email: 'Valid email address',
    'phone-us': 'US phone number (10 digits)',
    'phone-intl': 'International phone (E.164 format)',
    cnic: 'Pakistan CNIC (XXXXX-XXXXXXX-X)',
    'cnic-new': 'Pakistan CNIC new format',
    ntn: 'Pakistan NTN number',
    passport: 'Passport number',
    'passport-pk': 'Pakistan passport',
    url: 'Valid HTTP/HTTPS URL',
    ipv4: 'IPv4 address',
    username: 'Username (3-16 alphanumeric, underscore, hyphen)',
    'password-strong': 'Strong password (8+ chars, uppercase, lowercase, number, special)',
    'credit-card': 'Credit card number (13-19 digits)',
    'zipcode-us': 'US ZIP code',
    'date-iso': 'ISO date format (YYYY-MM-DD)',
    'time-24h': '24-hour time format (HH:MM)',
    alphanumeric: 'Alphanumeric characters only',
    'no-spaces': 'No whitespace allowed',
    'uppercase-only': 'Uppercase letters only',
    'lowercase-only': 'Lowercase letters only',
    name: 'Name (starts with capital letter)',
    number: 'Numbers only',
  };

  return descriptions[patternId] ?? 'Custom pattern';
}

/**
 * Convert old FieldValidation to new ValidationRules
 * (For backward compatibility)
 */
export function fieldValidationToRules(validation: FieldValidation | undefined): ValidationRules {
  if (!validation) return {};

  return {
    minLength: validation.minLength,
    minLengthMessage: validation.minLengthMessage,
    maxLength: validation.maxLength,
    maxLengthMessage: validation.maxLengthMessage,
    pattern: validation.regex ? 'custom' : undefined,
    customRegex: validation.regex,
    patternMessage: validation.regexMessage || validation.validationMessage,
    min: validation.min,
    minMessage: validation.minMessage,
    max: validation.max,
    maxMessage: validation.maxMessage,
  };
}
