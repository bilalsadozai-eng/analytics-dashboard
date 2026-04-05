import React, { memo, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, GripVertical,
  Edit2, Trash2, TrendingUpIcon
} from 'lucide-react';
import { cn, generateChartData, generateStatData, generateActivityData, COLOR_SCHEMES, PIE_COLORS, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import type { Widget, ColorScheme } from '@/types';

// ─── Shared Widget Shell ─────────────────────────────────────────────────────
interface WidgetShellProps {
  widget: Widget;
  theme: string;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  dragHandleProps?: Record<string, unknown>;
}

export const WidgetShell = memo(function WidgetShell({
  widget, theme, isSelected, canEdit, onSelect, onEdit, onDelete, children, dragHandleProps
}: WidgetShellProps) {
  const isDark = theme === 'dark';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'h-full flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden group',
        isDark
          ? 'bg-surface-900/60 backdrop-blur-sm border-white/[0.07]'
          : 'bg-white border-slate-200/80 shadow-sm',
        isSelected && 'ring-2 ring-indigo-500/60 border-indigo-500/40',
        'hover:border-white/15'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center gap-2 px-4 py-3 border-b', isDark ? 'border-white/[0.06]' : 'border-slate-100')}>
        {canEdit && (
          <div
            {...dragHandleProps}
            className={cn('cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
              isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'
            )}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}
        <h3 className={cn('text-sm font-semibold flex-1 truncate', isDark ? 'text-white' : 'text-slate-900')}>
          {widget.title}
        </h3>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={cn('p-1 rounded-md transition-colors', isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded-md hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4">
        {children}
      </div>
    </div>
  );
});

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-xl px-3 py-2 shadow-glass text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Line Chart Widget ───────────────────────────────────────────────────────
export const LineChartWidget = memo(function LineChartWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const data = useMemo(() => generateChartData(widget.dataSource, widget.timeRange), [widget.dataSource, widget.timeRange]);
  const scheme = COLOR_SCHEMES[widget.colorScheme as ColorScheme] || COLOR_SCHEMES.blue;
  const isDark = theme === 'dark';

  const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name') : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          {scheme.chart.slice(0, keys.length).map((color, i) => (
            <linearGradient key={i} id={`gradient-${widget.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }} />
        {keys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={scheme.chart[i] || scheme.primary}
            strokeWidth={2}
            fill={`url(#gradient-${widget.id}-${i})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Bar Chart Widget ────────────────────────────────────────────────────────
export const BarChartWidget = memo(function BarChartWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const data = useMemo(() => generateChartData(widget.dataSource, widget.timeRange), [widget.dataSource, widget.timeRange]);
  const scheme = COLOR_SCHEMES[widget.colorScheme as ColorScheme] || COLOR_SCHEMES.green;
  const isDark = theme === 'dark';

  const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name') : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }} />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={scheme.chart[i] || scheme.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

// ─── Pie Chart Widget ────────────────────────────────────────────────────────
export const PieChartWidget = memo(function PieChartWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const data = useMemo(() => generateChartData(widget.dataSource, widget.timeRange), [widget.dataSource, widget.timeRange]);
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

// ─── Stat Card Widget ────────────────────────────────────────────────────────
export const StatCardWidget = memo(function StatCardWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const stat = useMemo(() => generateStatData(widget.dataSource), [widget.dataSource]);
  const scheme = COLOR_SCHEMES[widget.colorScheme as ColorScheme] || COLOR_SCHEMES.blue;
  const isDark = theme === 'dark';

  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400';
  const trendBg = stat.trend === 'up' ? 'bg-emerald-500/10' : stat.trend === 'down' ? 'bg-red-500/10' : 'bg-slate-500/10';

  const formattedValue = stat.prefix === '$'
    ? formatCurrency(stat.value)
    : stat.suffix === '%'
    ? formatPercent(stat.value)
    : formatNumber(stat.value);

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <p className={cn('text-3xl font-display font-bold tracking-tight mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          {formattedValue}
        </p>
        <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium', trendBg, trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(stat.change).toFixed(1)}% vs last period</span>
        </div>
      </div>
      <div className={cn('h-1.5 rounded-full overflow-hidden mt-3', isDark ? 'bg-white/5' : 'bg-slate-100')}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', scheme.gradient)}
          style={{ width: `${Math.min(100, Math.abs(stat.change) * 5 + 40)}%`, transition: 'width 1s ease' }}
        />
      </div>
    </div>
  );
});

// ─── Table Widget ────────────────────────────────────────────────────────────
export const TableWidget = memo(function TableWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const data = useMemo(() => generateActivityData(), []);
  const isDark = theme === 'dark';

  const typeColors: Record<string, string> = {
    view:   'bg-blue-500/15 text-blue-400',
    export: 'bg-purple-500/15 text-purple-400',
    edit:   'bg-amber-500/15 text-amber-400',
    add:    'bg-emerald-500/15 text-emerald-400',
  };

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className={cn('border-b', isDark ? 'border-white/[0.06]' : 'border-slate-100')}>
            {['User', 'Action', 'Time', 'Type'].map(h => (
              <th key={h} className={cn('text-left pb-2 font-semibold', isDark ? 'text-slate-500' : 'text-slate-400')}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className={cn('border-b', isDark ? 'border-white/[0.03]' : 'border-slate-50')}>
              <td className={cn('py-2 font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{row.user}</td>
              <td className={cn('py-2 max-w-[120px] truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>{row.action}</td>
              <td className={cn('py-2 whitespace-nowrap', isDark ? 'text-slate-500' : 'text-slate-400')}>{row.time}</td>
              <td className="py-2">
                <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', typeColors[row.type] || 'bg-slate-500/15 text-slate-400')}>
                  {row.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// ─── Text Widget ─────────────────────────────────────────────────────────────
export const TextWidget = memo(function TextWidget({
  widget, theme
}: { widget: Widget; theme: string }) {
  const isDark = theme === 'dark';
  return (
    <div className="h-full">
      <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
        {widget.content || 'Click edit to add notes, annotations, or any text content here. Great for documenting dashboard context and sharing insights with your team.'}
      </p>
    </div>
  );
});
