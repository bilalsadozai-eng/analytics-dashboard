import { useState } from 'react';
import { X } from 'lucide-react';
import type { Widget, ColorScheme, DataSource, TimeRange } from '@/types';

interface Props { widget: Widget; onSave: (widget: Widget) => void; onClose: () => void; }

const COLOR_OPTIONS: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'blue',   label: 'Indigo', color: '#6366f1' },
  { value: 'green',  label: 'Emerald', color: '#10b981' },
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'red',    label: 'Rose', color: '#ef4444' },
  { value: 'amber',  label: 'Amber', color: '#f59e0b' },
  { value: 'cyan',   label: 'Cyan', color: '#06b6d4' },
];

const DATA_SOURCES: { value: DataSource; label: string }[] = [
  { value: 'sales', label: 'Sales Data' },
  { value: 'users', label: 'User Activity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'traffic', label: 'Traffic Sources' },
  { value: 'categories', label: 'Categories' },
  { value: 'activity', label: 'Recent Activity' },
  { value: 'conversion', label: 'Conversion Rate' },
  { value: 'bounce', label: 'Bounce Rate' },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '1y', label: 'Last year' },
];

export function EditWidgetModal({ widget, onSave, onClose }: Props) {
  const [form, setForm] = useState<Widget>({ ...widget });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-900 border border-white/10 rounded-2xl shadow-glass-lg animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h2 className="font-display font-bold text-white">Edit Widget</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-surface-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Color Scheme</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button key={c.value} onClick={() => setForm({ ...form, colorScheme: c.value })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${form.colorScheme === c.value ? 'border-white/30 bg-white/10 text-white' : 'border-white/8 text-slate-400 hover:border-white/15'}`}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Data Source</label>
            <select value={form.dataSource} onChange={(e) => setForm({ ...form, dataSource: e.target.value as DataSource })} className="w-full bg-surface-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-colors">
              {DATA_SOURCES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Time Range</label>
            <div className="flex gap-2">
              {TIME_RANGES.map((t) => (
                <button key={t.value} onClick={() => setForm({ ...form, timeRange: t.value })} className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${form.timeRange === t.value ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-white/8 text-slate-400 hover:border-white/15'}`}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
