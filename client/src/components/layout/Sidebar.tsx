import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TrendingUp, BarChart2, PieChart, CreditCard, Table2, Type, Clock, Activity } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatTime } from '@/lib/utils';
import type { WidgetType } from '@/types';

const WIDGET_LIBRARY: { type: WidgetType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { type: 'line',  label: 'Line Chart',   desc: 'Trends over time',      icon: TrendingUp, color: 'text-indigo-400' },
  { type: 'bar',   label: 'Bar Chart',    desc: 'Category comparison',   icon: BarChart2,  color: 'text-emerald-400' },
  { type: 'pie',   label: 'Pie Chart',    desc: 'Distribution breakdown', icon: PieChart,   color: 'text-purple-400' },
  { type: 'stat',  label: 'KPI Card',     desc: 'Single metric + trend', icon: CreditCard, color: 'text-amber-400' },
  { type: 'table', label: 'Activity Table', desc: 'Recent events log',   icon: Table2,     color: 'text-cyan-400' },
  { type: 'text',  label: 'Notes',        desc: 'Text & annotations',    icon: Type,       color: 'text-rose-400' },
];

function DraggableWidgetItem({ type, label, desc, icon: Icon, color }: typeof WIDGET_LIBRARY[0]) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `new-${type}`, data: { type, isNew: true, title: label } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`group flex items-center gap-3 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${isDragging ? 'opacity-50 scale-95' : 'border-white/6 hover:border-white/15 hover:bg-white/5'} bg-surface-900/50`}>
      <div className={`w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-200 text-xs font-semibold leading-none">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}

export const Sidebar = memo(function Sidebar() {
  const { isSidebarOpen, activityLogs } = useDashboardStore();

  return (
    <aside className={`flex-shrink-0 border-r border-white/6 bg-surface-900/60 backdrop-blur-xl flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-56' : 'w-0 overflow-hidden'}`}>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Widget Library */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Widget Library</p>
          <p className="text-slate-600 text-xs mb-2 px-1">Drag to canvas →</p>
          <div className="space-y-1.5">
            {WIDGET_LIBRARY.map((w) => <DraggableWidgetItem key={w.type} {...w} />)}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Activity className="w-3 h-3 text-slate-500" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Activity</p>
          </div>
          <div className="space-y-1.5">
            {activityLogs.length === 0 ? (
              <p className="text-slate-600 text-xs px-1">No activity yet</p>
            ) : (
              activityLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex gap-2 px-1">
                  <Clock className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-indigo-400 text-xs font-medium">{log.user} </span>
                    <span className="text-slate-500 text-xs">{log.action}</span>
                    <p className="text-slate-600 text-xs">{formatTime(log.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
});
