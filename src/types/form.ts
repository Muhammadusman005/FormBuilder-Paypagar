export type FieldType = 'text' | 'number' | 'dropdown' | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for dropdown
}

export interface FormSchema {
  id: string;
  title: string;
  fields: FormField[];
  status: 'draft' | 'published';
}
