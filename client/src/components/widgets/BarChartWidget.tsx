import { memo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateChartData, COLOR_SCHEMES } from '@/lib/utils';
import type { Widget, ChartDataPoint } from '@/types';

export const BarChartWidget = memo(function BarChartWidget({ widget }: { widget: Widget }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const scheme = COLOR_SCHEMES[widget.colorScheme] ?? COLOR_SCHEMES.green;

  useEffect(() => {
    const update = () => setData(generateChartData(widget.dataSource, widget.timeRange));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [widget.dataSource, widget.timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
        <Bar dataKey="value" fill={scheme.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
