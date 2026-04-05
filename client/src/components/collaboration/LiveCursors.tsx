import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import type { CursorUpdate } from '@/types';

interface CursorState { [socketId: string]: CursorUpdate & { opacity: number } }

export function LiveCursors() {
  const { user } = useAuthStore();
  const [cursors, setCursors] = useState<CursorState>({});

  useEffect(() => {
    const handleCursorUpdate = (data: CursorUpdate) => {
      setCursors((prev) => ({ ...prev, [data.socketId]: { ...data, opacity: 1 } }));
    };
    const handleCursorRemove = (socketId: string) => {
      setCursors((prev) => { const next = { ...prev }; delete next[socketId]; return next; });
    };
    socket.on('cursor:update', handleCursorUpdate);
    socket.on('cursor:remove', handleCursorRemove);
    return () => { socket.off('cursor:update', handleCursorUpdate); socket.off('cursor:remove', handleCursorRemove); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Object.values(cursors).map(({ socketId, user: cursorUser, cursor }) => {
        if (user && cursorUser.id === user.id) return null;
        return (
          <div key={socketId} className="absolute transition-all duration-75 ease-linear" style={{ left: cursor.x, top: cursor.y, transform: 'translate(-2px, -2px)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5.5 3.5L16.5 10L10.5 11.5L8 17.5L5.5 3.5Z" fill={cursorUser.color} stroke="white" strokeWidth="1.5" />
            </svg>
            <div className="absolute left-4 top-4 px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap" style={{ backgroundColor: cursorUser.color }}>
              {cursorUser.name.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
