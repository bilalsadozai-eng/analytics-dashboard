import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Widget, ColorScheme, DataSource, TimeRange, WidgetType } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';

interface EditModalProps {
  widget: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

const COLOR_OPTIONS: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'blue',   label: 'Indigo',  color: '#6366f1' },
  { value: 'green',  label: 'Emerald', color: '#10b981' },
  { value: 'purple', label: 'Purple',  color: '#a855f7' },
  { value: 'red',    label: 'Rose',    color: '#ef4444' },
  { value: 'amber',  label: 'Amber',   color: '#f59e0b' },
  { value: 'cyan',   label: 'Cyan',    color: '#06b6d4' },
];

const DATA_SOURCES: { value: DataSource; label: string; types: WidgetType[] }[] = [
  { value: 'sales',      label: 'Sales Data',       types: ['line', 'bar'] },
  { value: 'users',      label: 'User Growth',      types: ['line', 'bar'] },
  { value: 'revenue',    label: 'Revenue',          types: ['stat', 'line'] },
  { value: 'traffic',    label: 'Traffic Sources',  types: ['pie'] },
  { value: 'categories', label: 'By Category',      types: ['bar', 'pie'] },
  { value: 'activity',   label: 'Recent Activity',  types: ['table'] },
  { value: 'conversion', label: 'Conversion Rate',  types: ['stat'] },
  { value: 'bounce',     label: 'Bounce Rate',      types: ['stat'] },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d',  label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '1y',  label: 'Last year' },
];

const SIZES: { label: string; w: number }[] = [
  { label: 'Small (3 cols)',  w: 3 },
  { label: 'Medium (6 cols)', w: 6 },
  { label: 'Large (12 cols)', w: 12 },
];

export default function EditModal({ widget, onSave, onClose }: EditModalProps) {
  const { theme } = useDashboardStore();
  const [draft, setDraft] = useState<Widget>({ ...widget });
  const isDark = theme === 'dark';

  const availableSources = DATA_SOURCES.filter(
    ds => ds.types.includes(draft.type) || draft.type === 'text'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md rounded-2xl border shadow-glass-lg animate-slide-up',
        isDark ? 'bg-surface-900 border-white/10' : 'bg-white border-slate-200'
      )}>
        {/* Header */}
        <div className={cn('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-white/[0.07]' : 'border-slate-100')}>
          <h2 className={cn('font-display font-semibold text-base', isDark ? 'text-white' : 'text-slate-900')}>
            Edit Widget
          </h2>
          <button onClick={onClose} className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-white/8 text-slate-400' : 'hover:bg-slate-100 text-slate-500')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Widget Title</label>
            <input
              value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors',
                isDark
                  ? 'bg-surface-800 border-white/10 text-white focus:border-indigo-500/60 placeholder:text-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400'
              )}
              placeholder="Enter title..."
            />
          </div>

          {/* Color Scheme */}
          <div>
            <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Color Theme</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDraft(d => ({ ...d, colorScheme: opt.value }))}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    draft.colorScheme === opt.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: opt.color }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Data Source */}
          {draft.type !== 'text' && (
            <div>
              <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Data Source</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSources.map(ds => (
                  <button
                    key={ds.value}
                    onClick={() => setDraft(d => ({ ...d, dataSource: ds.value }))}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all',
                      draft.dataSource === ds.value
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : isDark
                        ? 'bg-surface-800 border-white/8 text-slate-400 hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {ds.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Range */}
          {draft.type !== 'text' && draft.type !== 'stat' && (
            <div>
              <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Time Range</label>
              <div className="flex gap-2">
                {TIME_RANGES.map(tr => (
                  <button
                    key={tr.value}
                    onClick={() => setDraft(d => ({ ...d, timeRange: tr.value }))}
                    className={cn(
                      'flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      draft.timeRange === tr.value
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : isDark
                        ? 'bg-surface-800 border-white/8 text-slate-400 hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    )}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div>
            <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Widget Size</label>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button
                  key={s.w}
                  onClick={() => setDraft(d => ({ ...d, w: s.w }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    draft.w === s.w
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : isDark
                      ? 'bg-surface-800 border-white/8 text-slate-400 hover:border-white/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text content */}
          {draft.type === 'text' && (
            <div>
              <label className={cn('block text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>Content</label>
              <textarea
                value={draft.content || ''}
                onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                rows={4}
                className={cn(
                  'w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors resize-none',
                  isDark
                    ? 'bg-surface-800 border-white/10 text-white focus:border-indigo-500/60'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400'
                )}
                placeholder="Write your notes here..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn('flex items-center justify-end gap-2 px-5 py-4 border-t', isDark ? 'border-white/[0.07]' : 'border-slate-100')}>
          <button onClick={onClose} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors border', isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}>
            Cancel
          </button>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
