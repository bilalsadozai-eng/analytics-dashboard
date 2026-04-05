import { memo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { generateStatData, formatNumber, formatPercent, COLOR_SCHEMES } from '@/lib/utils';
import type { Widget, StatData } from '@/types';

export const StatWidget = memo(function StatWidget({ widget }: { widget: Widget }) {
  const [data, setData] = useState<StatData | null>(null);
  const scheme = COLOR_SCHEMES[widget.colorScheme] ?? COLOR_SCHEMES.blue;

  useEffect(() => {
    const update = () => setData(generateStatData(widget.dataSource));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [widget.dataSource]);

  if (!data) return <div className="animate-pulse h-16 bg-white/5 rounded-lg" />;

  const isUp = data.trend === 'up';
  const isDown = data.trend === 'down';
  const displayValue = data.prefix ? `${data.prefix}${formatNumber(data.value)}` : data.suffix ? `${data.value}${data.suffix}` : formatNumber(data.value);

  return (
    <div className="h-full flex flex-col justify-between p-1">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium self-start ${scheme.bg} ${scheme.text}`}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: scheme.primary }} />
        Live
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-white mb-1" style={{ color: scheme.primary }}>{displayValue}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : isDown ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          {formatPercent(Math.abs(data.change))} vs last period
        </div>
      </div>
    </div>
  );
});
