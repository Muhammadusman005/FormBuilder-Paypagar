import { FIELD_COMPONENTS } from './FieldComponents';
import { GripVertical } from 'lucide-react';

interface Props {
  onDragStart: (componentType: string) => void;
}

export const FieldPalette = ({ onDragStart }: Props) => {
  return (
    <div className="w-52 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-800">Components</h3>
        <p className="text-xs text-slate-400 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {FIELD_COMPONENTS.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={() => onDragStart(component.type)}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm transition-all group select-none"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 flex-shrink-0" />
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                {component.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Drag a component to the canvas to add it to your form
        </p>
      </div>
    </div>
  );
};
