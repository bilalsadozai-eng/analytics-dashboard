import { useEffect, useRef, useCallback } from 'react';
import { socket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Widget, DashboardState } from '@/types';

export function useSocket() {
  const { user } = useAuthStore();
  const {
    setWidgets,
    addWidget,
    updateWidget,
    deleteWidget,
    setDashboardTitle,
    setConnectedUsers,
    addActivityLog,
    setIsConnected,
  } = useDashboardStore();

  const mouseMoveThrottle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    connectSocket();

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('user:join', user);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Dashboard sync
    socket.on('dashboard:sync', (state: DashboardState) => {
      setWidgets(state.widgets);
      setDashboardTitle(state.title);
    });

    socket.on('dashboard:titleChanged', (title: string) => {
      setDashboardTitle(title);
    });

    // Widget changes from other users
    socket.on('widget:changed', ({ widget, action }: { widget: Widget; action: string }) => {
      if (action === 'add') addWidget(widget);
      else if (action === 'edit' || action === 'move') updateWidget(widget);
      else if (action === 'delete') deleteWidget(widget.id);
    });

    // User presence
    socket.on('users:update', (users) => {
      setConnectedUsers(users);
    });

    // Activity log
    socket.on('activity:new', (log) => {
      addActivityLog(log);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('dashboard:sync');
      socket.off('dashboard:titleChanged');
      socket.off('widget:changed');
      socket.off('users:update');
      socket.off('activity:new');
      disconnectSocket();
    };
  }, [user]);

  // Throttled cursor tracking
  const trackCursor = useCallback((e: MouseEvent) => {
    if (mouseMoveThrottle.current) return;
    mouseMoveThrottle.current = setTimeout(() => {
      mouseMoveThrottle.current = null;
      if (socket.connected) {
        socket.emit('cursor:move', { x: e.clientX, y: e.clientY });
      }
    }, 50); // 20fps max
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', trackCursor);
    return () => {
      window.removeEventListener('mousemove', trackCursor);
      if (mouseMoveThrottle.current) clearTimeout(mouseMoveThrottle.current);
    };
  }, [trackCursor]);

  // Emit helpers
  const emitWidgetUpdate = useCallback(
    (widget: Widget, action: 'add' | 'edit' | 'delete' | 'move') => {
      if (!user) return;
      socket.emit('widget:update', { widget, action, userName: user.name });
    },
    [user]
  );

  const emitTitleUpdate = useCallback(
    (title: string) => {
      if (!user) return;
      socket.emit('dashboard:title', { title, userName: user.name });
    },
    [user]
  );

  return { emitWidgetUpdate, emitTitleUpdate, socket };
}
