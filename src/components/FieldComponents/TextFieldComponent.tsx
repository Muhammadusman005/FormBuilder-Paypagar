import type { FormField } from '../../types/form';
import { Type } from 'lucide-react';

export const TextFieldComponent = {
  icon: Type,
  label: 'Text Input',
  type: 'text' as const,
  create: (): FormField => ({
    id: Date.now().toString(),
    type: 'text',
    label: 'Text Field',
    required: false,
    placeholder: 'Enter text...',
  }),
};
