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
