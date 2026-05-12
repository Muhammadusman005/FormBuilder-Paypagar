import { FIELD_COMPONENTS } from './FieldComponents';
import { GripVertical, MousePointerClick } from 'lucide-react';

// Must match the key used in FormCanvas
const DT_PALETTE = 'application/x-palette-type';

interface Props {
  onDragStart: (componentType: string) => void;
  onAddField?: (componentType: string) => void;
}

export const FieldPalette = ({ onDragStart, onAddField }: Props) => {
  return (
    <div className="w-52 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Fields</h3>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <MousePointerClick className="w-3 h-3" /> Click or drag to add
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {FIELD_COMPONENTS.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => {
                // Store type in dataTransfer so drop handlers always have fresh data
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData(DT_PALETTE, component.type);
                onDragStart(component.type);
              }}
              onClick={() => onAddField?.(component.type)}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm active:scale-95 transition-all group select-none"
              title={`Add ${component.label} field`}
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 flex-shrink-0" />
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-slate-200 group-hover:border-indigo-200 flex-shrink-0 transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700">
                {component.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Drag into a row or click to append
        </p>
      </div>
    </div>
  );
};
