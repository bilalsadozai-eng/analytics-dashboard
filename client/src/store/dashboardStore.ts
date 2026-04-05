import { create } from 'zustand';
import type { Widget, ConnectedUser, ActivityLog, Theme } from '@/types';

interface DashboardStore {
  // State
  widgets: Widget[];
  dashboardTitle: string;
  selectedWidgetId: string | null;
  connectedUsers: ConnectedUser[];
  activityLogs: ActivityLog[];
  isConnected: boolean;
  theme: Theme;
  isSidebarOpen: boolean;
  lastUpdated: string;
  lastUpdatedBy: string;

  // Actions
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (widget: Widget) => void;
  deleteWidget: (id: string) => void;
  setDashboardTitle: (title: string) => void;
  selectWidget: (id: string | null) => void;
  setConnectedUsers: (users: ConnectedUser[]) => void;
  addActivityLog: (log: ActivityLog) => void;
  setIsConnected: (connected: boolean) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLastUpdated: (by: string) => void;
  importDashboard: (widgets: Widget[], title: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  widgets: [],
  dashboardTitle: 'Analytics Dashboard',
  selectedWidgetId: null,
  connectedUsers: [],
  activityLogs: [],
  isConnected: false,
  theme: 'dark',
  isSidebarOpen: true,
  lastUpdated: new Date().toISOString(),
  lastUpdatedBy: 'System',

  setWidgets: (widgets) => set({ widgets }),
  addWidget: (widget) => set((s) => ({ widgets: [...s.widgets, widget] })),
  updateWidget: (widget) =>
    set((s) => ({ widgets: s.widgets.map((w) => (w.id === widget.id ? widget : w)) })),
  deleteWidget: (id) =>
    set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id), selectedWidgetId: s.selectedWidgetId === id ? null : s.selectedWidgetId })),
  setDashboardTitle: (title) => set({ dashboardTitle: title }),
  selectWidget: (id) => set({ selectedWidgetId: id }),
  setConnectedUsers: (users) => set({ connectedUsers: users }),
  addActivityLog: (log) =>
    set((s) => ({ activityLogs: [log, ...s.activityLogs].slice(0, 50) })),
  setIsConnected: (connected) => set({ isConnected: connected }),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setLastUpdated: (by) => set({ lastUpdated: new Date().toISOString(), lastUpdatedBy: by }),
  importDashboard: (widgets, title) => set({ widgets, dashboardTitle: title }),
}));
