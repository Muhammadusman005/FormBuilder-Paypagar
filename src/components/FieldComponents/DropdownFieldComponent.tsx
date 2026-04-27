import type { FormField } from '../../types/form';
import { ChevronDown } from 'lucide-react';

export const DropdownFieldComponent = {
  icon: ChevronDown,
  label: 'Dropdown',
  type: 'dropdown' as const,
  create: (): FormField => ({
    id: Date.now().toString(),
    type: 'dropdown',
    label: 'Dropdown Field',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  }),
};
