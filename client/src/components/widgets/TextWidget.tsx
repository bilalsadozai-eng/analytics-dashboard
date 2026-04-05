import { memo, useState } from 'react';
import type { Widget } from '@/types';

export const TextWidget = memo(function TextWidget({ widget, canEdit }: { widget: Widget; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(widget.content ?? 'Click to add notes...');

  return (
    <div className="h-full" onDoubleClick={() => canEdit && setEditing(true)}>
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          className="w-full h-full bg-transparent text-slate-300 text-sm resize-none outline-none placeholder-slate-600"
          placeholder="Type your notes here..."
        />
      ) : (
        <p className={`text-sm leading-relaxed ${text === 'Click to add notes...' ? 'text-slate-600 italic' : 'text-slate-300'}`}>{text}</p>
      )}
      {canEdit && !editing && <p className="text-slate-600 text-xs mt-2">Double-click to edit</p>}
    </div>
  );
});
