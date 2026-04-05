import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ChartDataPoint, StatData, DataSource, TimeRange, ColorScheme } from '@/types';

// ─── Class Merging ───────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Format Helpers ──────────────────────────────────────────────────────────
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

// ─── Mock Data Generator ─────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

const DAYS_7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function generateChartData(source: DataSource, timeRange: TimeRange): ChartDataPoint[] {
  const labels = timeRange === '7d' ? DAYS_7 : timeRange === '30d' ? DAYS_30 : MONTHS;

  switch (source) {
    case 'sales':
      return labels.map((name) => ({
        name,
        Revenue: randomInt(20000, 80000),
        Profit: randomInt(8000, 30000),
      }));
    case 'users':
      return labels.map((name) => ({
        name,
        'New Users': randomInt(500, 3000),
        'Returning': randomInt(200, 1500),
      }));
    case 'revenue':
      return labels.map((name) => ({
        name,
        value: randomInt(15000, 90000),
        prev: randomInt(10000, 70000),
      }));
    case 'traffic':
      return [
        { name: 'Organic', value: randomInt(35, 45) },
        { name: 'Direct', value: randomInt(20, 30) },
        { name: 'Social', value: randomInt(15, 25) },
        { name: 'Email', value: randomInt(8, 15) },
        { name: 'Paid', value: randomInt(5, 12) },
      ];
    case 'categories':
      return [
        { name: 'Electronics', value: randomInt(40000, 90000) },
        { name: 'Clothing', value: randomInt(25000, 55000) },
        { name: 'Home', value: randomInt(20000, 45000) },
        { name: 'Sports', value: randomInt(15000, 35000) },
        { name: 'Books', value: randomInt(8000, 20000) },
        { name: 'Other', value: randomInt(5000, 15000) },
      ];
    default:
      return labels.map((name) => ({ name, value: randomInt(100, 1000) }));
  }
}

export function generateStatData(source: DataSource): StatData {
  switch (source) {
    case 'revenue':
      return { value: randomInt(85000, 150000), change: randomBetween(-5, 15), trend: 'up', prefix: '$' };
    case 'users':
      return { value: randomInt(12000, 30000), change: randomBetween(-3, 20), trend: 'up' };
    case 'conversion':
      return { value: parseFloat(randomBetween(2.5, 8.5).toFixed(1)), change: randomBetween(-2, 5), trend: 'up', suffix: '%' };
    case 'bounce':
      return { value: parseFloat(randomBetween(25, 55).toFixed(1)), change: randomBetween(-8, 3), trend: 'down', suffix: '%' };
    case 'sales':
      return { value: randomInt(5000, 15000), change: randomBetween(5, 25), trend: 'up' };
    default:
      return { value: randomInt(1000, 9999), change: randomBetween(-10, 20), trend: 'up' };
  }
}

export function generateActivityData() {
  const actions = [
    'viewed the revenue report',
    'exported dashboard to PDF',
    'updated chart settings',
    'added new widget',
    'changed color scheme',
    'applied date filter',
    'refreshed data sources',
    'shared dashboard link',
  ];
  const names = ['Sarah K.', 'John M.', 'Lisa R.', 'Tom H.', 'Amy C.', 'Mark P.'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `activity-${i}`,
    user: names[randomInt(0, names.length)],
    action: actions[randomInt(0, actions.length)],
    time: `${randomInt(1, 59)}m ago`,
    type: ['view', 'export', 'edit', 'add'][randomInt(0, 4)] as string,
  }));
}

// ─── Color Scheme Helpers ─────────────────────────────────────────────────────
export const COLOR_SCHEMES: Record<ColorScheme, { primary: string; gradient: string; text: string; bg: string; chart: string[] }> = {
  blue:   { primary: '#6366f1', gradient: 'from-indigo-500 to-blue-600',   text: 'text-indigo-400', bg: 'bg-indigo-500/10',  chart: ['#6366f1', '#818cf8', '#a5b4fc'] },
  green:  { primary: '#10b981', gradient: 'from-emerald-500 to-teal-600',  text: 'text-emerald-400', bg: 'bg-emerald-500/10', chart: ['#10b981', '#34d399', '#6ee7b7'] },
  purple: { primary: '#a855f7', gradient: 'from-purple-500 to-violet-600', text: 'text-purple-400', bg: 'bg-purple-500/10',  chart: ['#a855f7', '#c084fc', '#d8b4fe'] },
  red:    { primary: '#ef4444', gradient: 'from-red-500 to-rose-600',      text: 'text-red-400',    bg: 'bg-red-500/10',    chart: ['#ef4444', '#f87171', '#fca5a5'] },
  amber:  { primary: '#f59e0b', gradient: 'from-amber-500 to-orange-500',  text: 'text-amber-400', bg: 'bg-amber-500/10',   chart: ['#f59e0b', '#fbbf24', '#fcd34d'] },
  cyan:   { primary: '#06b6d4', gradient: 'from-cyan-500 to-sky-600',      text: 'text-cyan-400',  bg: 'bg-cyan-500/10',    chart: ['#06b6d4', '#22d3ee', '#67e8f9'] },
};

export const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

// ─── Widget Defaults ─────────────────────────────────────────────────────────
export function getWidgetDefaultTitle(type: string): string {
  const titles: Record<string, string> = {
    line: 'Line Chart',
    bar: 'Bar Chart',
    pie: 'Pie Chart',
    stat: 'KPI Card',
    table: 'Activity Table',
    text: 'Notes',
  };
  return titles[type] ?? 'Widget';
}
