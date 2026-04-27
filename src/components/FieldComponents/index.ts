import { TextFieldComponent } from './TextFieldComponent';
import { NumberFieldComponent } from './NumberFieldComponent';
import { DropdownFieldComponent } from './DropdownFieldComponent';
import { FileFieldComponent } from './FileFieldComponent';

export const FIELD_COMPONENTS = [
  TextFieldComponent,
  NumberFieldComponent,
  DropdownFieldComponent,
  FileFieldComponent,
];

export type FieldComponentType = typeof FIELD_COMPONENTS[number];
