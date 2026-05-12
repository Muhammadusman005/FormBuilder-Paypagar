import type { FormField } from '../../types/form';
import { CheckSquare } from 'lucide-react';
import { generateId } from '../../utils/form';

export const CheckboxFieldComponent = {
  icon: CheckSquare,
  label: 'Checkbox',
  type: 'checkbox' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'checkbox',
    label: 'Checkbox Group',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  }),
};
