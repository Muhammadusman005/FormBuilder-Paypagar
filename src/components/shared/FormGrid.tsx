/**
 * FormGrid
 *
 * Shared 4-column grid wrapper for rendering form fields.
 * Uses inline styles to avoid Tailwind purging dynamic colSpan classes.
 *
 * Used by FormCanvas, FormPreview, and SubmitForm.
 */
import type { FormField } from '../../types/form';
import { GRID_COLUMNS } from '../../constants';

interface Props {
  fields: FormField[];
  gap?: number;
  renderField: (field: FormField) => React.ReactNode;
}

export const FormGrid = ({ fields, gap = 16, renderField }: Props) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
      gap,
    }}
  >
    {fields.map((field) => (
      <div
        key={field.id}
        style={{ gridColumn: `span ${field.colSpan ?? GRID_COLUMNS}` }}
      >
        {renderField(field)}
      </div>
    ))}
  </div>
);
