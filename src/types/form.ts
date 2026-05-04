export type FieldType = 'text' | 'number' | 'dropdown' | 'file';

export interface FieldValidation {
  regex?: string;               // custom regex pattern (text fields)
  regexMessage?: string;        // message shown when regex fails
  minLength?: number;           // min character length (text fields)
  minLengthMessage?: string;    // message shown when minLength fails
  maxLength?: number;           // max character length (text fields)
  maxLengthMessage?: string;    // message shown when maxLength fails
  min?: number;                 // min value (number fields)
  minMessage?: string;          // message shown when min fails
  max?: number;                 // max value (number fields)
  maxMessage?: string;          // message shown when max fails
  /** @deprecated use regexMessage instead — kept for backward compatibility */
  validationMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2 | 3 | 4; // out of 4 columns, default 4 (full width)
  validation?: FieldValidation;
}

export interface SubForm {
  id: string;
  name: string;
  category?: string; // e.g., "personal_info", "business_info", "kyc", "documents"
  fields: FormField[];
}

export interface FormSchema {
  id: string;
  name: string;
  sub_forms: SubForm[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// Legacy support
export interface LegacyFormSchema {
  id: string;
  title: string;
  fields: FormField[];
  status: 'draft' | 'published';
}
