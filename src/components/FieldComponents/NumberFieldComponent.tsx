import type { FormField } from '../../types/form';
import { Hash } from 'lucide-react';

export const NumberFieldComponent = {
  icon: Hash,
  label: 'Number',
  type: 'number' as const,
  create: (): FormField => ({
    id: Date.now().toString(),
    type: 'number',
    label: 'Number Field',
    required: false,
    placeholder: 'Enter number...',
  }),
};
