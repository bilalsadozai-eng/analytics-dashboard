import { memo, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateChartData, COLOR_SCHEMES } from '@/lib/utils';
import type { Widget, ChartDataPoint } from '@/types';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 border border-white/10 rounded-xl p-3 shadow-glass">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export const LineChartWidget = memo(function LineChartWidget({ widget }: { widget: Widget }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const scheme = COLOR_SCHEMES[widget.colorScheme] ?? COLOR_SCHEMES.blue;

  useEffect(() => {
    const update = () => setData(generateChartData(widget.dataSource, widget.timeRange));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [widget.dataSource, widget.timeRange]);

  const keys = data[0] ? Object.keys(data[0]).filter((k) => k !== 'name') : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        {keys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={scheme.chart[i % scheme.chart.length]} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: scheme.chart[i % scheme.chart.length] }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
});
