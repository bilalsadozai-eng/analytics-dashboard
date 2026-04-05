import { useEffect, useRef, useState, useCallback } from 'react';
import { DndContext, type DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { EditWidgetModal } from '@/components/ui/EditWidgetModal';
import { LiveCursors } from '@/components/collaboration/LiveCursors';
import { ToastProvider, toast } from '@/components/ui/Toast';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { getWidgetDefaultTitle } from '@/lib/utils';
import type { Widget, WidgetType, DashboardState } from '@/types';

const COL = 12;
const ROW_HEIGHT = 120;

function genId() { return `widget-${Math.random().toString(36).slice(2)}-${Date.now()}`; }

function getWidgetStyle(widget: Widget, cw: number) {
  const colW = cw / COL;
  return { left: widget.x * colW, top: widget.y * ROW_HEIGHT, width: widget.w * colW, height: widget.h * ROW_HEIGHT };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { widgets, dashboardTitle, selectWidget } = useDashboardStore();
  const { emitWidgetUpdate } = useSocket();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver((e) => setCanvasWidth(e[0].contentRect.width));
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const isNew = active.data.current?.isNew as boolean;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const colW = canvasWidth / COL;

    if (isNew) {
      const type = active.data.current?.type as WidgetType;
      const activatorEvent = event.activatorEvent as PointerEvent;
      const dropX = activatorEvent.clientX + delta.x - canvasRect.left;
      const dropY = activatorEvent.clientY + delta.y - canvasRect.top;
      const defaultW = type === 'stat' ? 3 : type === 'pie' ? 4 : 6;
      const snapX = Math.max(0, Math.min(Math.round(dropX / colW), COL - defaultW));
      const snapY = Math.max(0, Math.round(dropY / ROW_HEIGHT));
      const newWidget: Widget = {
        id: genId(), type,
        title: getWidgetDefaultTitle(type),
        x: snapX, y: snapY, w: defaultW, h: type === 'stat' ? 2 : 4,
        colorScheme: 'blue', dataSource: 'sales', timeRange: '30d',
      };
      useDashboardStore.getState().addWidget(newWidget);
      emitWidgetUpdate(newWidget, 'add');
      toast(`${getWidgetDefaultTitle(type)} added!`, 'success');
    } else {
      const widget = active.data.current?.widget as Widget;
      if (!widget) return;
      const newX = widget.x * colW + delta.x;
      const newY = widget.y * ROW_HEIGHT + delta.y;
      const snapX = Math.max(0, Math.min(Math.round(newX / colW), COL - widget.w));
      const snapY = Math.max(0, Math.round(newY / ROW_HEIGHT));
      const updated = { ...widget, x: snapX, y: snapY };
      useDashboardStore.getState().updateWidget(updated);
      emitWidgetUpdate(updated, 'move');
    }
  }, [canvasWidth, emitWidgetUpdate]);

  const handleSaveWidget = useCallback((updated: Widget) => {
    useDashboardStore.getState().updateWidget(updated);
    emitWidgetUpdate(updated, 'edit');
    toast('Widget updated', 'success');
  }, [emitWidgetUpdate]);

  const handleDeleteWidget = useCallback((id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;
    useDashboardStore.getState().deleteWidget(id);
    emitWidgetUpdate(widget, 'delete');
    toast('Widget removed', 'info');
  }, [widgets, emitWidgetUpdate]);

  const handleResizeWidget = useCallback((id: string, newW: number) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;
    const updated = { ...widget, w: newW };
    useDashboardStore.getState().updateWidget(updated);
    emitWidgetUpdate(updated, 'move');
  }, [widgets, emitWidgetUpdate]);

  const handleExportPDF = useCallback(async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(canvasRef.current!, { backgroundColor: '#0f172a', scale: 1.5 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${dashboardTitle.replace(/\s+/g, '_')}.pdf`);
      toast('Exported as PDF!', 'success');
    } catch { toast('PDF export failed', 'error'); }
  }, [dashboardTitle]);

  const handleExportJSON = useCallback(() => {
    const state: DashboardState = { widgets, title: dashboardTitle, lastUpdated: new Date().toISOString(), lastUpdatedBy: user?.name ?? '' };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${dashboardTitle.replace(/\s+/g, '_')}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast('Exported as JSON!', 'success');
  }, [widgets, dashboardTitle, user]);

  const handleImportJSON = useCallback(() => fileInputRef.current?.click(), []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const state = JSON.parse(ev.target?.result as string) as DashboardState;
        useDashboardStore.getState().importDashboard(state.widgets, state.title);
        toast('Dashboard imported!', 'success');
      } catch { toast('Invalid JSON file', 'error'); }
    };
    reader.readAsText(file); e.target.value = '';
  }, []);

  const maxY = widgets.reduce((m, w) => Math.max(m, w.y + w.h), 0);
  const gridHeight = Math.max(maxY * ROW_HEIGHT + ROW_HEIGHT * 2, 600);

  return (
    <div className="flex flex-col h-screen bg-surface-950 text-white overflow-hidden">
      <Header onExportPDF={handleExportPDF} onExportJSON={handleExportJSON} onImportJSON={handleImportJSON} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div ref={canvasRef} className="relative w-full" style={{ height: gridHeight }} onClick={() => selectWidget(null)}>
              {widgets.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pointer-events-none">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl animate-float">📊</div>
                  <h3 className="text-white font-display font-bold text-xl">Dashboard is empty</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Drag widgets from the left sidebar onto this canvas to get started</p>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize: `${100/COL}% ${ROW_HEIGHT}px` }} />
              {widgets.map((widget) => {
                const s = getWidgetStyle(widget, canvasWidth);
                return (
                  <div key={widget.id} className="absolute" style={{ left: s.left, top: s.top, width: s.width, height: s.height, padding: 4 }}>
                    <WidgetContainer widget={widget} onEdit={setEditingWidget} onDelete={handleDeleteWidget} onResize={handleResizeWidget} />
                  </div>
                );
              })}
            </div>
          </DndContext>
        </main>
      </div>
      <LiveCursors />
      <ToastProvider />
      {editingWidget && <EditWidgetModal widget={editingWidget} onSave={handleSaveWidget} onClose={() => setEditingWidget(null)} />}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
