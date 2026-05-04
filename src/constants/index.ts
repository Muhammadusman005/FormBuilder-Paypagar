// ── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY  = 'auth_user';

// ── Form grid ─────────────────────────────────────────────────────────────────
export const GRID_COLUMNS = 4;

// ── Field type metadata ───────────────────────────────────────────────────────
import { Type, Hash, ChevronDown, Upload } from 'lucide-react';
import type { FieldType } from '../types/form';

export interface FieldTypeMeta {
  label: string;
  icon: React.ElementType;
  /** Tailwind classes for badge/icon coloring */
  color: string;
}

export const FIELD_TYPE_META: Record<FieldType, FieldTypeMeta> = {
  text:     { label: 'Text',        icon: Type,        color: 'bg-blue-50 text-blue-600 border-blue-200' },
  number:   { label: 'Number',      icon: Hash,        color: 'bg-purple-50 text-purple-600 border-purple-200' },
  dropdown: { label: 'Dropdown',    icon: ChevronDown, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  file:     { label: 'File Upload', icon: Upload,      color: 'bg-green-50 text-green-600 border-green-200' },
};

// ── Column span options ───────────────────────────────────────────────────────
export const COL_SPAN_OPTIONS: { value: 1 | 2 | 3 | 4; label: string; desc: string }[] = [
  { value: 1, label: '1/4',  desc: 'Quarter' },
  { value: 2, label: '1/2',  desc: 'Half' },
  { value: 3, label: '3/4',  desc: 'Three quarters' },
  { value: 4, label: 'Full', desc: 'Full width' },
];

// ── Predefined Regex Patterns ───────────────────────────────────────────────────
export interface RegexPattern {
  id: string;
  label: string;
  pattern: string;
  description: string;
  example: string;
}

export const REGEX_PATTERNS: RegexPattern[] = [
  {
    id: 'email',
    label: 'Email Address',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    description: 'Valid email format',
    example: 'user@example.com',
  },
  {
    id: 'phone-us',
    label: 'US Phone Number',
    pattern: '^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
    description: 'US phone: (123) 456-7890 or 123-456-7890',
    example: '(555) 123-4567',
  },
  {
    id: 'phone-intl',
    label: 'International Phone',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    description: 'E.164 format: +1234567890',
    example: '+1 555 123 4567',
  },
  {
    id: 'url',
    label: 'Website URL',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: 'Valid HTTP/HTTPS URL',
    example: 'https://www.example.com',
  },
  {
    id: 'username',
    label: 'Username',
    pattern: '^[a-zA-Z0-9_-]{3,16}$',
    description: 'Alphanumeric, underscore, hyphen (3-16 chars)',
    example: 'john_doe-123',
  },
  {
    id: 'password-strong',
    label: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Min 8 chars: uppercase, lowercase, number, special char',
    example: 'SecurePass123!',
  },
  {
    id: 'zipcode-us',
    label: 'US ZIP Code',
    pattern: '^\\d{5}(-\\d{4})?$',
    description: 'Format: 12345 or 12345-6789',
    example: '90210 or 90210-1234',
  },
  {
    id: 'credit-card',
    label: 'Credit Card',
    pattern: '^\\d{13,19}$',
    description: '13-19 digit card number',
    example: '4532015112830366',
  },
  {
    id: 'ipv4',
    label: 'IPv4 Address',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'Valid IPv4: 192.168.1.1',
    example: '192.168.1.1',
  },
  {
    id: 'hex-color',
    label: 'Hex Color Code',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'Format: #RRGGBB or #RGB',
    example: '#FF5733 or #F57',
  },
  {
    id: 'date-iso',
    label: 'ISO Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    description: 'Format: 2024-12-31',
    example: '2024-12-31',
  },
  {
    id: 'time-24h',
    label: 'Time (24-hour)',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
    description: 'Format: HH:MM (00:00 - 23:59)',
    example: '14:30',
  },
  {
    id: 'alphanumeric',
    label: 'Alphanumeric Only',
    pattern: '^[a-zA-Z0-9]+$',
    description: 'Letters and numbers only',
    example: 'abc123XYZ',
  },
  {
    id: 'no-spaces',
    label: 'No Spaces',
    pattern: '^\\S+$',
    description: 'No whitespace allowed',
    example: 'no-spaces-here',
  },
  {
    id: 'uppercase-only',
    label: 'Uppercase Only',
    pattern: '^[A-Z]+$',
    description: 'Capital letters only',
    example: 'HELLO',
  },
  {
    id: 'lowercase-only',
    label: 'Lowercase Only',
    pattern: '^[a-z]+$',
    description: 'Lowercase letters only',
    example: 'hello',
  },
];
