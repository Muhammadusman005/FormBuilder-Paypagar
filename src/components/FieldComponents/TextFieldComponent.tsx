import type { FormField } from '../../types/form';
import { Type } from 'lucide-react';
import { generateId } from '../../utils/form';

export const TextFieldComponent = {
  icon: Type,
  label: 'Text Input',
  type: 'text' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'text',
    label: 'Text Field',
    required: false,
    placeholder: 'Enter text...',
  }),
};
