import { TextFieldComponent } from './TextFieldComponent';
import { NumberFieldComponent } from './NumberFieldComponent';
import { DropdownFieldComponent } from './DropdownFieldComponent';
import { FileFieldComponent } from './FileFieldComponent';
import { RadioFieldComponent } from './RadioFieldComponent';
import { CheckboxFieldComponent } from './CheckboxFieldComponent';
import { DualInputFieldComponent } from './DualInputFieldComponent';

export const FIELD_COMPONENTS = [
  TextFieldComponent,
  NumberFieldComponent,
  DropdownFieldComponent,
  FileFieldComponent,
  RadioFieldComponent,
  CheckboxFieldComponent,
  DualInputFieldComponent,
];

export type FieldComponentType = typeof FIELD_COMPONENTS[number];
