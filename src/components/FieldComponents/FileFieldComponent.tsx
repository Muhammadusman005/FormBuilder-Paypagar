import type { FormField } from '../../types/form';
import { Upload } from 'lucide-react';

export const FileFieldComponent = {
  icon: Upload,
  label: 'File Upload',
  type: 'file' as const,
  create: (): FormField => ({
    id: Date.now().toString(),
    type: 'file',
    label: 'File Upload',
    required: false,
  }),
};
