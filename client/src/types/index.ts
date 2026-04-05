// ─── User & Auth ────────────────────────────────────────────────────────────
export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  color: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Widget ─────────────────────────────────────────────────────────────────
export type WidgetType = 'line' | 'bar' | 'pie' | 'stat' | 'table' | 'text';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'amber' | 'cyan';
export type DataSource = 'sales' | 'users' | 'revenue' | 'traffic' | 'categories' | 'activity' | 'conversion' | 'bounce';
export type TimeRange = '7d' | '30d' | '1y';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  w: number; // 3, 6, or 12 columns
  h: number; // grid rows
  colorScheme: ColorScheme;
  dataSource: DataSource;
  timeRange: TimeRange;
  content?: string; // for text widget
}

export interface WidgetSize {
  label: string;
  w: number;
  h: number;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export interface DashboardState {
  widgets: Widget[];
  title: string;
  lastUpdated: string;
  lastUpdatedBy: string;
}

// ─── Collaboration ───────────────────────────────────────────────────────────
export interface ConnectedUser {
  socketId: string;
  user: User;
  cursor: { x: number; y: number };
  joinedAt: string;
}

export interface CursorUpdate {
  socketId: string;
  user: User;
  cursor: { x: number; y: number };
}

// ─── Activity ────────────────────────────────────────────────────────────────
export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

// ─── Socket Events ───────────────────────────────────────────────────────────
export interface ServerToClientEvents {
  'dashboard:sync': (state: DashboardState) => void;
  'dashboard:titleChanged': (title: string) => void;
  'widget:changed': (data: { widget: Widget; action: string }) => void;
  'users:update': (users: ConnectedUser[]) => void;
  'cursor:update': (data: CursorUpdate) => void;
  'cursor:remove': (socketId: string) => void;
  'activity:new': (log: ActivityLog) => void;
}

export interface ClientToServerEvents {
  'user:join': (user: User) => void;
  'cursor:move': (data: { x: number; y: number }) => void;
  'widget:update': (data: { widget: Widget; action: string; userName: string }) => void;
  'dashboard:title': (data: { title: string; userName: string }) => void;
  'dashboard:import': (data: { state: DashboardState; userName: string }) => void;
}

// ─── Chart Data ──────────────────────────────────────────────────────────────
export interface ChartDataPoint {
  name: string;
  value: number;
  prev?: number;
  [key: string]: string | number | undefined;
}

export interface StatData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  prefix?: string;
  suffix?: string;
}

// ─── Drag & Drop ─────────────────────────────────────────────────────────────
export interface DragItem {
  id: string;
  type: WidgetType;
  title: string;
  isNew?: boolean;
}

// ─── Theme ───────────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';
