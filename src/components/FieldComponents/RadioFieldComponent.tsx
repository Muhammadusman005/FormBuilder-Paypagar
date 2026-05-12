import type { FormField } from '../../types/form';
import { Circle } from 'lucide-react';
import { generateId } from '../../utils/form';

export const RadioFieldComponent = {
  icon: Circle,
  label: 'Radio',
  type: 'radio' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'radio',
    label: 'Radio Group',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  }),
};
