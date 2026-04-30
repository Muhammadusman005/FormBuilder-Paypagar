import type { FormField } from '../../types/form';
import { Upload } from 'lucide-react';
import { generateId } from '../../utils/form';

export const FileFieldComponent = {
  icon: Upload,
  label: 'File Upload',
  type: 'file' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'file',
    label: 'File Upload',
    required: false,
    placeholder: 'Upload Statement...',
  }),
};
