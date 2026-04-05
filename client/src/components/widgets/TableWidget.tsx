import { memo, useEffect, useState } from 'react';
import { generateActivityData } from '@/lib/utils';

interface ActivityRow { id: string; user: string; action: string; time: string; type: string }

const TYPE_COLORS: Record<string, string> = {
  view: 'bg-blue-500/20 text-blue-300',
  export: 'bg-amber-500/20 text-amber-300',
  edit: 'bg-emerald-500/20 text-emerald-300',
  add: 'bg-purple-500/20 text-purple-300',
};

export const TableWidget = memo(function TableWidget() {
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const update = () => setRows(generateActivityData());
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/6">
            <th className="text-left text-slate-500 font-medium py-2 pr-3">User</th>
            <th className="text-left text-slate-500 font-medium py-2 pr-3">Action</th>
            <th className="text-left text-slate-500 font-medium py-2 pr-3">Type</th>
            <th className="text-right text-slate-500 font-medium py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
              <td className="py-2 pr-3 text-slate-300 font-medium">{row.user}</td>
              <td className="py-2 pr-3 text-slate-400 max-w-[140px] truncate">{row.action}</td>
              <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded-full text-xs ${TYPE_COLORS[row.type] || 'bg-slate-500/20 text-slate-300'}`}>{row.type}</span></td>
              <td className="py-2 text-right text-slate-500">{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
