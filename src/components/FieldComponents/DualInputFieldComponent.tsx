import type { FormField } from '../../types/form';
import { SplitSquareHorizontal } from 'lucide-react';
import { generateId } from '../../utils/form';

export const DualInputFieldComponent = {
  icon: SplitSquareHorizontal,
  label: 'Dual Input',
  type: 'dual-input' as const,
  create: (): FormField => ({
    id: generateId(),
    type: 'dual-input',
    label: 'Dual Input',
    required: false,
    placeholder: 'Enter value...',
    dualInputLabels: ['Min', 'Max'],
  }),
};
