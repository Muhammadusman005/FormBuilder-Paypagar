import type { FormField } from '../../types/form';
import { Hash } from 'lucide-react';
import { generateId } from '../../utils/form';

export const NumberFieldComponent = {
  icon: Hash,
  label: 'Number',
  type: 'number' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'number',
    label: 'Number Field',
    required: false,
    placeholder: 'Enter number...',
  }),
};
