import { memo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateChartData, PIE_COLORS } from '@/lib/utils';
import type { Widget, ChartDataPoint } from '@/types';

export const PieChartWidget = memo(function PieChartWidget({ widget }: { widget: Widget }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const update = () => setData(generateChartData(widget.dataSource, widget.timeRange));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [widget.dataSource, widget.timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" innerRadius="40%" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
});
