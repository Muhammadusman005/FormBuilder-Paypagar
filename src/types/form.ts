export type FieldType = 'text' | 'number' | 'dropdown' | 'file';

export interface FieldValidation {
  regex?: string;        // custom regex pattern (text fields)
  minLength?: number;    // min character length (text fields)
  maxLength?: number;    // max character length (text fields)
  min?: number;          // min value (number fields)
  max?: number;          // max value (number fields)
  validationMessage?: string; // custom message shown when validation fails
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

export interface FormSchema {
  id: string;
  title: string;
  fields: FormField[];
  status: 'draft' | 'published';
}

export interface FormSchema {
  id: string;
  title: string;
  fields: FormField[];
  status: 'draft' | 'published';
}
