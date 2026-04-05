import { memo } from 'react';
import {
  WidgetShell,
  LineChartWidget,
  BarChartWidget,
  PieChartWidget,
  StatCardWidget,
  TableWidget,
  TextWidget,
} from './ChartWidgets';
import type { Widget } from '@/types';

interface WidgetRendererProps {
  widget: Widget;
  theme: string;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const WidgetRenderer = memo(function WidgetRenderer({
  widget,
  theme,
  isSelected,
  canEdit,
  onSelect,
  onEdit,
  onDelete,
}: WidgetRendererProps) {
  const renderContent = () => {
    switch (widget.type) {
      case 'line':  return <LineChartWidget  widget={widget} theme={theme} />;
      case 'bar':   return <BarChartWidget   widget={widget} theme={theme} />;
      case 'pie':   return <PieChartWidget   widget={widget} theme={theme} />;
      case 'stat':  return <StatCardWidget   widget={widget} theme={theme} />;
      case 'table': return <TableWidget      widget={widget} theme={theme} />;
      case 'text':  return <TextWidget       widget={widget} theme={theme} />;
      default:      return null;
    }
  };

  return (
    <WidgetShell
      widget={widget}
      theme={theme}
      isSelected={isSelected}
      canEdit={canEdit}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      {renderContent()}
    </WidgetShell>
  );
});

export default WidgetRenderer;
