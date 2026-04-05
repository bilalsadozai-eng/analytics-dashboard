import { memo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Edit3, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { cn, COLOR_SCHEMES } from '@/lib/utils';
import { StatWidget } from './StatWidget';
import { LineChartWidget } from './LineChartWidget';
import { BarChartWidget } from './BarChartWidget';
import { PieChartWidget } from './PieChartWidget';
import { TableWidget } from './TableWidget';
import { TextWidget } from './TextWidget';
import type { Widget } from '@/types';

interface WidgetContainerProps {
  widget: Widget;
  onEdit: (widget: Widget) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, w: number) => void;
}

function WidgetContent({ widget }: { widget: Widget }) {
  const { user } = useAuthStore();
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  switch (widget.type) {
    case 'line':  return <LineChartWidget widget={widget} />;
    case 'bar':   return <BarChartWidget widget={widget} />;
    case 'pie':   return <PieChartWidget widget={widget} />;
    case 'stat':  return <StatWidget widget={widget} />;
    case 'table': return <TableWidget />;
    case 'text':  return <TextWidget widget={widget} canEdit={canEdit} />;
    default:      return null;
  }
}

export const WidgetContainer = memo(function WidgetContainer({ widget, onEdit, onDelete, onResize }: WidgetContainerProps) {
  const { selectedWidgetId, selectWidget } = useDashboardStore();
  const { user } = useAuthStore();
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  const canDelete = user?.role === 'admin';
  const isSelected = selectedWidgetId === widget.id;
  const scheme = COLOR_SCHEMES[widget.colorScheme] ?? COLOR_SCHEMES.blue;

  const { attributes, listeners, setNodeRef: dragRef, isDragging } = useDraggable({
    id: widget.id,
    disabled: !canEdit,
    data: { widget, isNew: false },
  });

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectWidget(isSelected ? null : widget.id);
  }, [isSelected, widget.id, selectWidget]);

  return (
    <div
      ref={dragRef}
      onClick={handleSelect}
      className={cn(
        'group relative h-full bg-surface-900/80 backdrop-blur-sm border rounded-2xl flex flex-col overflow-hidden transition-all duration-200',
        isDragging ? 'opacity-40 scale-95 shadow-2xl z-50' : 'opacity-100',
        isSelected ? 'border-indigo-500/50 shadow-glow' : 'border-white/8 hover:border-white/15',
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center gap-2 px-3 py-2.5 border-b border-white/6 flex-shrink-0', scheme.bg)}>
        {canEdit && (
          <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}
        <h3 className="flex-1 text-sm font-semibold text-slate-200 truncate">{widget.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Resize buttons */}
          {canEdit && widget.w < 12 && (
            <button onClick={(e) => { e.stopPropagation(); onResize(widget.id, Math.min(widget.w + 3, 12)); }} className="p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Expand"><Maximize2 className="w-3 h-3" /></button>
          )}
          {canEdit && widget.w > 3 && (
            <button onClick={(e) => { e.stopPropagation(); onResize(widget.id, Math.max(widget.w - 3, 3)); }} className="p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Shrink"><Minimize2 className="w-3 h-3" /></button>
          )}
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(widget); }} className="p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Edit"><Edit3 className="w-3 h-3" /></button>
          )}
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }} className="p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-3 h-3" /></button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-3">
        <WidgetContent widget={widget} />
      </div>
    </div>
  );
});
