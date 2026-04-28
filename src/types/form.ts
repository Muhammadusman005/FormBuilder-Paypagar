export type FieldType = 'text' | 'number' | 'dropdown' | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2 | 3 | 4; // out of 4 columns, default 4 (full width)
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
